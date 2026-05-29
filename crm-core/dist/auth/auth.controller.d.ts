import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: Request): Promise<import("./auth.service").AuthResponse>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    logout(user: User, body: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
    me(user: User): Promise<{
        userId: string;
        email: string;
        fullName: string;
        fullNameAr: string;
        phone: string;
        avatarUrl: string;
        tenantId: string;
        userGroupId: string;
        language: string;
        timezone: string;
        twoFactorEnabled: boolean;
        lastLogin: Date;
    }>;
    setup2FA(user: User): Promise<{
        secret: string;
        qrCodeUrl: string;
        otpauthUrl: string;
    }>;
    verify2FA(user: User, dto: Verify2FADto): Promise<{
        success: boolean;
    }>;
    disable2FA(user: User, dto: Verify2FADto): Promise<{
        success: boolean;
    }>;
}
