export declare class UserSession {
    sessionId: string;
    userId: string;
    tenantId: string;
    refreshTokenHash: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}
