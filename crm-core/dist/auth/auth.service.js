"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const uuid_1 = require("uuid");
const user_entity_1 = require("../users/entities/user.entity");
const tenant_entity_1 = require("../tenants/entities/tenant.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const permissions_service_1 = require("../permissions/permissions.service");
const audit_service_1 = require("../audit/audit.service");
let AuthService = class AuthService {
    constructor(userRepo, tenantRepo, sessionRepo, jwtService, configService, permissionsService, auditService) {
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
        this.sessionRepo = sessionRepo;
        this.jwtService = jwtService;
        this.configService = configService;
        this.permissionsService = permissionsService;
        this.auditService = auditService;
    }
    async login(loginDto, ipAddress, userAgent) {
        const { email, password, tenantCode, twoFactorCode } = loginDto;
        const tenant = await this.tenantRepo.findOne({
            where: { tenantCode: tenantCode.toUpperCase(), isActive: true },
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid tenant or credentials');
        }
        const user = await this.userRepo.findOne({
            where: { email: email.toLowerCase(), tenantId: tenant.tenantId },
            relations: ['userGroup'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
            throw new common_1.ForbiddenException(`Account locked. Try again in ${minutes} minutes.`);
        }
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            await this.handleFailedLogin(user);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Your account has been deactivated. Contact your administrator.');
        }
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                return { requiresTwoFactor: true };
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
                throw new common_1.UnauthorizedException('Invalid two-factor authentication code');
            }
        }
        await this.userRepo.update(user.userId, {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLogin: new Date(),
            loginCount: () => 'login_count + 1',
        });
        const tokens = await this.generateTokens(user, tenant);
        await this.createSession(user.userId, tenant.tenantId, tokens.refreshToken, ipAddress, userAgent);
        const permissions = await this.permissionsService.getPermissionMap(tenant.tenantId, user.userGroupId);
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
    async refreshToken(dto) {
        const tokenHash = await bcrypt.hash(dto.refreshToken, 10);
        const session = await this.sessionRepo.findOne({
            where: { refreshTokenHash: dto.refreshToken, isRevoked: false },
        });
        if (!session || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.userRepo.findOne({
            where: { userId: session.userId },
            relations: ['userGroup'],
        });
        const tenant = await this.tenantRepo.findOne({ where: { tenantId: session.tenantId } });
        const payload = {
            sub: user.userId,
            email: user.email,
            tenantId: user.tenantId,
            userGroupId: user.userGroupId,
            groupCode: user.userGroup?.groupCode,
            isSuperAdmin: user.isSuperAdmin || false,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.sessionRepo.update({ userId, refreshTokenHash: refreshToken }, { isRevoked: true });
        }
        else {
            await this.sessionRepo.update({ userId }, { isRevoked: true });
        }
    }
    async setup2FA(userId) {
        const user = await this.userRepo.findOne({ where: { userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const secret = speakeasy.generateSecret({
            name: `CRM Platform (${user.email})`,
            length: 32,
        });
        await this.userRepo.update(userId, { twoFactorSecret: secret.base32 });
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        return {
            secret: secret.base32,
            qrCodeUrl,
            otpauthUrl: secret.otpauth_url,
        };
    }
    async verify2FA(userId, dto) {
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
        if (!verified)
            throw new common_1.BadRequestException('Invalid verification code');
        await this.userRepo.update(userId, { twoFactorEnabled: true });
        return { success: true };
    }
    async disable2FA(userId, dto) {
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
        if (!verified)
            throw new common_1.BadRequestException('Invalid verification code');
        await this.userRepo.update(userId, { twoFactorEnabled: false, twoFactorSecret: null });
        return { success: true };
    }
    async generateTokens(user, tenant) {
        const payload = {
            sub: user.userId,
            email: user.email,
            tenantId: user.tenantId,
            userGroupId: user.userGroupId,
            groupCode: user.userGroup?.groupCode,
            isSuperAdmin: user.isSuperAdmin || false,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = (0, uuid_1.v4)() + '-' + (0, uuid_1.v4)();
        return { accessToken, refreshToken };
    }
    async createSession(userId, tenantId, refreshToken, ipAddress, userAgent) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.sessionRepo.save({
            userId,
            tenantId,
            refreshTokenHash: refreshToken,
            ipAddress,
            userAgent,
            expiresAt,
        });
    }
    async handleFailedLogin(user) {
        const failedCount = user.failedLoginCount + 1;
        const updates = { failedLoginCount: failedCount };
        if (failedCount >= 5) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + 30);
            updates.lockedUntil = lockUntil;
        }
        await this.userRepo.update(user.userId, updates);
    }
    async validateJwtPayload(payload) {
        const user = await this.userRepo.findOne({
            where: { userId: payload.sub, isActive: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found or inactive');
        user.isSuperAdmin = user.isSuperAdmin || payload.isSuperAdmin || false;
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(2, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        permissions_service_1.PermissionsService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map