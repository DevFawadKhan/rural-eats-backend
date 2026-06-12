import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { db } from '../../../db';
import { usersTable } from '../../../db/schema/users.schema';
import { customersTable } from '../../../db/schema/customers.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['access_token'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key_change_in_production',
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    if (payload.role === 'customer') {
      const customer = await db.query.customersTable.findFirst({
        where: eq(customersTable.id, payload.sub)
      });
      if (!customer) {
        throw new UnauthorizedException('Customer no longer exists');
      }
      return { id: payload.sub, email: payload.email, role: payload.role };
    } else {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, payload.sub)
      });
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }
      return { id: payload.sub, email: payload.email, role: payload.role };
    }
  }
}
