import { CustomDecorator, Module } from "@nestjs/common";
import { SetMetadata } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UsersModule } from "src/users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { FortyTwoStrategy } from "./42.strategy";

@Module ({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "30d" },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, FortyTwoStrategy],
    exports: [AuthService],
})
export class AuthModule {}
