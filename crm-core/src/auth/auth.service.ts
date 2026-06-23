import {
  Injectable, UnauthorizedException, BadRequestException,
  ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UserSession } from './entities/user-session.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  tenantId: string;
  userGroupId: string;
  groupCode: string;
  isSuperAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    email: string;
    fullName: string;
    tenantId: string;
    userGroupId: string;
    groupCode: string;
    language: string;
    timezone: string;
    avatarUrl: string;
  };
  tenant: {
    tenantId: string;
    companyName: string;
    logoUrl: string;
    primaryColor: string;
    language: string;
    dateFormat: string;
    currencyCode: string;
    activeModules: string[];
  };
  permissions: Record<string, any>;
  requiresTwoFactor?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Login ────────────────────────────────────────────────────
  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    const { email, password, tenantCode, twoFactorCode } = loginDto;

    // Find tenant
    const tenant = await this.tenantRepo.findOne({
      where: { tenantCode: tenantCode.toUpperCase(), isActive: true },
    });
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant or credentials');
    }

    // Find user
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase(), tenantId: tenant.tenantId },
      relations: ['userGroup'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account locked after multiple failed attempts. Try again in ${minutes} minute(s), reset your password using "Forgot password", or contact your administrator.`);
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check user active
    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated. Contact your administrator.');
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return { requiresTwoFactor: true } as any;
      }
      const userWithSecret = await this.userRepo.findOne({
        where: { userId: user.userId },
        select: ['userId', 'twoFactorSecret'],
      });
      const verified = speakeasy.totp.verify({
        secret: userWithSecret.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2,
      });
      if (!verified) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    // Reset failed login count
    await this.userRepo.update(user.userId, {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLogin: new Date(),
      loginCount: () => 'login_count + 1',
    });

    // Build tokens
    const tokens = await this.generateTokens(user, tenant);

    // Save session
    await this.createSession(user.userId, tenant.tenantId, tokens.refreshToken, ipAddress, userAgent);

    // Load permission map
    const permissions = await this.permissionsService.getPermissionMap(
      tenant.tenantId,
      user.userGroupId,
    );

    // Audit log
    await this.auditService.log({
      tenantId: tenant.tenantId,
      userId: user.userId,
      userName: user.fullName,
      module: 'core',
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.userId,
      entityLabel: user.email,
      ipAddress,
      userAgent,
    });

    return {
      ...tokens,
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        tenantId: user.tenantId,
        userGroupId: user.userGroupId,
        groupCode: user.userGroup?.groupCode,
        language: user.language,
        timezone: user.timezone || tenant.timezone,
        avatarUrl: user.avatarUrl,
      },
      tenant: {
        tenantId: tenant.tenantId,
        companyName: tenant.companyName,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        language: tenant.language,
        dateFormat: tenant.dateFormat,
        currencyCode: tenant.currencyCode,
        activeModules: tenant.activeModules,
      },
      permissions,
    };
  }

  // ─── Refresh Token ────────────────────────────────────────────
  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    const tokenHash = await bcrypt.hash(dto.refreshToken, 10);

    const session = await this.sessionRepo.findOne({
      where: { refreshTokenHash: dto.refreshToken, isRevoked: false },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findOne({
      where: { userId: session.userId },
      relations: ['userGroup'],
    });
    const tenant = await this.tenantRepo.findOne({ where: { tenantId: session.tenantId } });

    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      userGroupId: user.userGroupId,
      groupCode: user.userGroup?.groupCode,
      isSuperAdmin: (user as any).isSuperAdmin || false,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  // ─── Logout ───────────────────────────────────────────────────
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.sessionRepo.update(
        { userId, refreshTokenHash: refreshToken },
        { isRevoked: true },
      );
    } else {
      // Revoke all sessions for user
      await this.sessionRepo.update({ userId }, { isRevoked: true });
    }
  }

  // ─── 2FA Setup ────────────────────────────────────────────────
  async setup2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string; otpauthUrl: string }> {
    const user = await this.userRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = speakeasy.generateSecret({
      name: `CRM Platform (${user.email})`,
      length: 32,
    });

    // Store secret temporarily (not enabled until verified)
    await this.userRepo.update(userId, { twoFactorSecret: secret.base32 });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
    };
  }

  async verify2FA(userId: string, dto: Verify2FADto): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({
      where: { userId },
      select: ['userId', 'twoFactorSecret'],
    });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.code,
      window: 2,
    });

    if (!verified) throw new BadRequestException('Invalid verification code');

    await this.userRepo.update(userId, { twoFactorEnabled: true });
    return { success: true };
  }

  async disable2FA(userId: string, dto: Verify2FADto): Promise<{ success: boolean }> {
    const user = await this.userRepo.findOne({
      where: { userId },
      select: ['userId', 'twoFactorSecret'],
    });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.code,
      window: 2,
    });

    if (!verified) throw new BadRequestException('Invalid verification code');

    await this.userRepo.update(userId, { twoFactorEnabled: false, twoFactorSecret: null });
    return { success: true };
  }

  // ─── Private Helpers ─────────────────────────────────────────
  private async generateTokens(user: User, tenant: Tenant) {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      userGroupId: user.userGroupId,
      groupCode: user.userGroup?.groupCode,
      isSuperAdmin: (user as any).isSuperAdmin || false,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4() + '-' + uuidv4(); // long random token

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: string,
    tenantId: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.sessionRepo.save({
      userId,
      tenantId,
      refreshTokenHash: refreshToken, // In production, store hash not raw token
      ipAddress,
      userAgent,
      expiresAt,
    });
  }

  // ── Self-service password reset ────────────────────────────────
  // forgotPassword: validate tenant+email, issue a one-time token, email a
  // reset link. Always returns a generic success (never reveals whether the
  // email exists) to avoid account enumeration.
  async forgotPassword(tenantCode: string, email: string, resetBaseUrl: string): Promise<{ message: string }> {
    const generic = { message: 'If an account exists for that email, a password reset link has been sent.' };
    try {
      const tenant = await this.tenantRepo.findOne({ where: { tenantCode } as any });
      if (!tenant) return generic;
      const user = await this.userRepo.findOne({
        where: { email: (email || '').toLowerCase(), tenantId: tenant.tenantId } as any,
      });
      if (!user) return generic;

      // Generate a cryptographically-strong token
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      const token = crypto.randomBytes(48).toString('hex'); // 96 chars
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any prior unused tokens for this user, then store the new one
      await this.userRepo.query(
        `UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`,
        [user.userId]);
      await this.userRepo.query(
        `INSERT INTO password_reset_tokens (tenant_id, user_id, token, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [tenant.tenantId, user.userId, token, expiresAt]);

      // Build the reset link and email it via the tenant's configured SMTP
      const link = `${resetBaseUrl}?token=${token}`;
      await this.sendResetEmail(tenant, user, link);

      return generic;
    } catch (e) {
      // Never leak internal errors on this public endpoint
      return generic;
    }
  }

  private async sendResetEmail(tenant: any, user: any, link: string): Promise<void> {
    const settings = (tenant as any).settings || {};
    const cfg = settings.emailConfig;
    if (!cfg?.host || !cfg?.username || !cfg?.password) {
      // Email not configured — silently skip (admin reset is the fallback).
      // eslint-disable-next-line no-console
      console.warn('[forgot-password] email not configured for tenant', tenant.tenantCode);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: cfg.host, port: cfg.port || 587, secure: cfg.secure || false,
      auth: { user: cfg.username, pass: cfg.password },
    });
    await transporter.sendMail({
      from: `"${cfg.fromName || 'Envoiso'}" <${cfg.fromEmail || cfg.username}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0B2547">Password Reset</h2>
          <p>Hello ${user.fullName || ''},</p>
          <p>We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${link}" style="background:#1A4D8F;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;display:inline-block">Reset Password</a>
          </p>
          <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
          <p style="color:#999;font-size:12px">${cfg.signature || ''}</p>
        </div>`,
    });
  }

  // resetPassword (self-service via token): validate token, set new password,
  // clear any lockout, mark token used.
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token || !newPassword || newPassword.length < 6) {
      throw new BadRequestException('A valid token and a password of at least 6 characters are required.');
    }
    const rows = await this.userRepo.query(
      `SELECT token_id::text AS id, user_id::text AS "userId", expires_at AS "expiresAt", used_at AS "usedAt"
       FROM password_reset_tokens WHERE token = $1 LIMIT 1`,
      [token]);
    const rec = rows?.[0];
    if (!rec) throw new BadRequestException('This reset link is invalid.');
    if (rec.usedAt) throw new BadRequestException('This reset link has already been used.');
    if (new Date(rec.expiresAt) < new Date()) throw new BadRequestException('This reset link has expired. Please request a new one.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(rec.userId, { passwordHash, failedLoginCount: 0, lockedUntil: null } as any);
    await this.userRepo.query(
      `UPDATE password_reset_tokens SET used_at = now() WHERE token_id = $1`, [rec.id]);

    return { message: 'Your password has been reset. You can now sign in with your new password.' };
  }


    private async handleFailedLogin(user: User) {
    const failedCount = user.failedLoginCount + 1;
    const updates: Partial<User> = { failedLoginCount: failedCount };

    // Lock after 5 failed attempts
    if (failedCount >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30); // 30 min lock
      updates.lockedUntil = lockUntil;
    }

    await this.userRepo.update(user.userId, updates);
  }

  // ─── Validate JWT (used by JwtStrategy) ──────────────────────
  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { userId: payload.sub, isActive: true },
    });
    if (!user) throw new UnauthorizedException('User not found or inactive');
    (user as any).isSuperAdmin = (user as any).isSuperAdmin || payload.isSuperAdmin || false;
    return user;
  }
}
