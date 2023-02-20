import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';

export type JwtPayload = {
  username: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    const extractJwtFromCookie = (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      console.log('Extracting token from cookie');
      console.log(token);
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };
    super({
      jwtFromRequest: extractJwtFromCookie,
      //TODO: change this to false in production
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('Validating payload');
    const user = await this.usersService.findOne(payload.username /*userId*/);

    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('Please log in to continue');
    }
    console.log('User found');
    return { username: payload.username };
  }
}
