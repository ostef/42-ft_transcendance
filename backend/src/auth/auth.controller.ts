import {
    Controller,
    Logger,
    Post,
    Body,
    HttpStatus,
    Response,
    Request,
    SetMetadata,
    Get,
    BadRequestException,
    UseGuards, UnauthorizedException, HttpCode,
} from "@nestjs/common";
import { IsNotEmpty } from "class-validator";
import { AuthService } from "./auth.service";
import { ExtractJwt } from "passport-jwt";
import { FortyTwoAuthGuard } from "./42_auth.guard";
import { UsersService } from "../users/users.service";

class LoginData
{
    @IsNotEmpty ()
    username: string;

    @IsNotEmpty ()
    password: string;
}

@Controller ("auth")
export class AuthController
{
    private logger: Logger = new Logger ("AuthController");

    constructor (
        private authService: AuthService,
        private usersService: UsersService,
    ) {}

    @SetMetadata ("isPublic", true)
    @Post ("login")
    async login (@Body () body: LoginData)
    {
        try
        {
            const token = await this.authService.login (body.username, body.password);

            return token;
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @SetMetadata ("isPublic", true)
    @UseGuards (FortyTwoAuthGuard)
    @Get("42")


    @SetMetadata ("isPublic", true)
    @UseGuards (FortyTwoAuthGuard)
    @Get("42/callback")
    async login42Callback (@Request () req, @Response () res)
    {
        try {
            const token = await this.authService.login42(req.user.username);
            res.cookie('token', token.access_token, {
                secure: false,
                sameSite: 'strict',
                maxAge: 3600 * 1000, // 1 hour
            });
            return res.status(HttpStatus.OK).send('<script>window.close();</script >');
        }
        catch (err) {
            this.logger.error(err);
            throw new BadRequestException(err.message);
        }
    }


    @SetMetadata ("isPublic", true)
    @Get ("check-jwt")
    async checkJwt (@Request () req)
    {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken () (req);

        const payload = this.authService.getPayloadFromToken (token);
        if (!payload)
            return false;

        return true;
    }

    @Post("2fa/authenticate")
    @HttpCode(200)
    async authenticate2fa(@Request() req, @Body() body) {
        const isCodeValid = await this.authService.isTwoFactorCodeValid(req.user.id, req.body.code);
        if (!isCodeValid)
            throw new UnauthorizedException('Invalid two-factor code');
        return this.authService.login2FA(req.user.id);
    }

    @Get('2fa/generate')
    async generate2fa(@Request() req)
    {
       const otpauth = await this.authService.generate2FASecret(req.user.id);
       return this.authService.generate2FAQrCode(otpauth) ;
    }

    @Post('2fa/turn-on')
    async turnOn2fa(@Request() req, @Body() body)
    {
        const code: string = body.code;
        console.log(code);
        const isCodeValid = this.authService.isTwoFactorCodeValid(code, req.user);
        if (!isCodeValid)
            throw new UnauthorizedException('Invalid two-factor code');
        await this.usersService.turnonTwoFactorAuth(req.user.id);
    }
}
