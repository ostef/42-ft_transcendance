import { Controller, Logger, Post, Body, HttpStatus, Response, Request, SetMetadata, Get } from "@nestjs/common";
import { IsNotEmpty } from "class-validator";
import { AuthService } from "./auth.service";
import { ExtractJwt } from "passport-jwt";

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
    async login (@Response () resp, @Body () body: LoginData)
    {
        try
        {
            const token = await this.authService.login (body.username, body.password);

            resp.send (token);
        }
        catch (err)
        {
            this.logger.error (err);
            resp.status (HttpStatus.BAD_REQUEST).send (err.message);
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
