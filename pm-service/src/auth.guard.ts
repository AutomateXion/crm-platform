import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'crm_jwt_super_secret_2024_change_in_production',
    });
  }
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, tenantId: payload.tenantId, role: payload.role };
  }
}

import { Injectable as Inj2 } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Inj2()
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
