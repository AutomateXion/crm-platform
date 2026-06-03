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
      throw new ForbiddenException(`Account locked. Try again in ${minutes} minutes.`);
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
