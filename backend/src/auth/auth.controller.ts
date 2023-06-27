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
    UseGuards,
} from "@nestjs/common";
import { IsNotEmpty } from "class-validator";
import { AuthService } from "./auth.service";
import { ExtractJwt } from "passport-jwt";
import { FortyTwoAuthGuard } from "./42_auth.guard";

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
    async login42 (@Request () req)
    {
        // const token = await this.authService.login42 (req);
        //
        // return token;
    }

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
}
