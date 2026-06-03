import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UserSession } from './entities/user-session.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
export interface JwtPayload {
    sub: string;
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
export declare class AuthService {
    private readonly userRepo;
    private readonly tenantRepo;
    private readonly sessionRepo;
    private readonly jwtService;
    private readonly configService;
    private readonly permissionsService;
    private readonly auditService;
    constructor(userRepo: Repository<User>, tenantRepo: Repository<Tenant>, sessionRepo: Repository<UserSession>, jwtService: JwtService, configService: ConfigService, permissionsService: PermissionsService, auditService: AuditService);
    login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponse>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    logout(userId: string, refreshToken?: string): Promise<void>;
    setup2FA(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
        otpauthUrl: string;
    }>;
    verify2FA(userId: string, dto: Verify2FADto): Promise<{
        success: boolean;
    }>;
    disable2FA(userId: string, dto: Verify2FADto): Promise<{
        success: boolean;
    }>;
    private generateTokens;
    private createSession;
    private handleFailedLogin;
    validateJwtPayload(payload: JwtPayload): Promise<User>;
}
