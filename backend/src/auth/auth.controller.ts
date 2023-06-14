import { Controller, Logger, Post, Body, HttpStatus, Response, Request, SetMetadata, Get, BadRequestException } from "@nestjs/common";
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
