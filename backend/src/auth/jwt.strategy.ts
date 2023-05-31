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
        const extractJwt = (req) => {
            let token = null;
            if (req && req.cookies)
                token = req.cookies["access_token"];

            return token || ExtractJwt.fromAuthHeaderAsBearerToken () (req);
        };

        super ({
            jwtFromRequest: extractJwt,
            ignoreExpiration: false,
            secretOrKey: "secret",
        });
    }

    async validate (payload: JwtPayload): Promise<UserEntity>
    {
        const user = await this.authService.validateUser (payload.userId);
        if (!user)
            throw new UnauthorizedException ("Invalid user");

        return user;
    }
}
