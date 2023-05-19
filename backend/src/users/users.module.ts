import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { FriendRequestEntity } from "./entities/friend_request.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module ({
    imports: [
        TypeOrmModule.forFeature ([
            UserEntity, FriendRequestEntity,
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
