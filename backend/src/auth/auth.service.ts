import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UserEntity } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable ()
export class AuthService
{
    constructor (
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser (userId: string): Promise<UserEntity>
    {
        const user = await this.usersService.findUserEntity ({id: userId});
        if (user)
        {
            const { password, ...result } = user;

            return result as UserEntity;
        }

        return null;
    }

    async login (username: string, password: string)
    {
        const user = await this.usersService.findUserEntity ({username: username});
        if (!user)
            throw new UnauthorizedException ();

        if (user.password != password)
            throw new UnauthorizedException ();

        const payload: JwtPayload = { userId: user.id };

        return {
            access_token: await this.jwtService.signAsync (payload)
        };
    }
}
