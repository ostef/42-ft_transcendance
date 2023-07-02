import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { UserEntity } from "src/users/entities/user.entity";
import { AuthService } from "./auth.service";

// This is the data that is associated to a JWT token
export type JwtPayload = {
    userId: string;
};

@Injectable ()
export class JwtStrategy extends PassportStrategy (Strategy, "jwtt")
{
    constructor (private readonly authService: AuthService)
    {
        super ({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken (),
            ignoreExpiration: false,
            secretOrKey: "secret",
        });
    }

    async validate (payload): Promise<UserEntity>
    {
        const user = await this.authService.validateUser (payload.userId);
        if (!user)
            throw new UnauthorizedException ("Invalid user");

        if (!user.has2FA) return user;
        if (payload.isTwoFactorCodeValid) return user;
        throw new UnauthorizedException ("Invalid 2FA auth");
    }
}
