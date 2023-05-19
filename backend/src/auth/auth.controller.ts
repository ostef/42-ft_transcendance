import { Controller, Logger, Post, Body, HttpStatus, Response, SetMetadata } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "./auth.module";

type LoginData = {
    username: string;
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

            resp.cookie("access_token", token, {
                secure: false,
                sameSite: "strict",
                maxAge: 3600 * 1000, // 1 hour
            });

            resp.send (token);
        }
        catch (err)
        {
            resp.status (HttpStatus.BAD_REQUEST).send (err.message);
        }
    }
}
