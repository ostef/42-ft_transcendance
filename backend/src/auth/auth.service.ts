import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UserEntity } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "./jwt.strategy";

@Injectable ()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {
    }

    async validateUser(userId: string): Promise<UserEntity> {
        const user = await this.usersService.findUserEntity({ id: userId });
        if (user) {
            const { password, ...result } = user;

            return result as UserEntity;
        }

        return null;
    }

    getPayloadFromToken(token: string): JwtPayload {
        return this.jwtService.decode(token) as JwtPayload;
    }

    async login(username: string, password: string) {
        const user = await this.usersService.findUserEntity({ username: username });
        if (!user)
            throw new UnauthorizedException("Invalid username");

        if (user.password != password)
            throw new UnauthorizedException("Invalid password");

        const payload: JwtPayload = { userId: user.id };

        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }

    async login42(username: string)
    {
        if (!username)
            throw new UnauthorizedException("Invalid username");
        let user = await this.usersService.findUserEntity({ username: username });
        if (!user)
           user = await this.usersService.createUser({ username: username, nickname: username, password: undefined });

        const payload: JwtPayload = { userId: user.id };

        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }
}
