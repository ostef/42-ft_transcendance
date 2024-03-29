import {Injectable, Logger, UnauthorizedException} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UserEntity } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { JwtPayload } from "./jwt.strategy";
import { authenticator } from "otplib";
import  { toDataURL } from "qrcode";

@Injectable ()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    )
    {}

    async validateUser(userId: string): Promise<UserEntity> {
        const user = await this.usersService.findUserEntity({ id: userId });
        if (user) {
            const { hashedPassword, twoFactorSecret, ...result } = user;

            return result as UserEntity;
        }

        return null;
    }

    getPayloadFromToken(token: string): JwtPayload | null {
        try
        {
            const decoded = this.jwtService.decode(token);
            if (!decoded)
                return null;

            return decoded as JwtPayload;
        }
        catch
        {
            return null;
        }
    }

    async login(username: string, password: string) {
        const user = await this.usersService.findUserEntity({ username: username });
        if (!user)
            throw new UnauthorizedException("Invalid username");

        if (!user.hashedPassword)
            throw new UnauthorizedException ("This user can only log in using 42 auth");

        if (user.hashedPassword != this.usersService.hashPassword (password))
            throw new UnauthorizedException("Invalid password");

        const payload: JwtPayload = {
            userId: user.id,
            has2FA: user.has2FA,
            is2FAAuthenticated: false
        };

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
        {
            // Try to find a nickname that is available by appending a
            // number until we find one that is available
            let nickname = username;
            let nicknameSuffix = 1;
            while (!await this.usersService.isNicknameAvailable (nickname))
            {
                nickname = username + nicknameSuffix.toString ();
                nicknameSuffix += 1;
            }

            user = await this.usersService.createUser({username: username, nickname: nickname, password: undefined});
            console.log ("Created new user from 42 login:", user);
        }

        const payload: JwtPayload = {
            userId: user.id,
            has2FA: user.has2FA,
            is2FAAuthenticated: false
        };

        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }

    async login2FA(oldpayload: JwtPayload)
    {
        const payload = {
            userId: oldpayload.userId,
            has2FA: oldpayload.has2FA,
            is2FAAuthenticated: true
        };

        return {
            access_token: await this.jwtService.signAsync(payload)
        }
    }

    async generate2FASecret(user: UserEntity)
    {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.username, "Ft_transcendance", secret);

        await this.usersService.updateUser(user.id, { twoFactorSecret: secret });
        return otpauthUrl;
    }

    generate2FAQrCode(otpAuthUrl: string)
    {
        return toDataURL(otpAuthUrl);
    }

    async isTwoFactorCodeValid(twoFactorCode: string, id: string)
    {
        const user = await this.usersService.findUserEntity({ id: id })
        if (!user)
            throw new UnauthorizedException("Invalid user");

        return authenticator.check(twoFactorCode, user.twoFactorSecret);
    }


}
