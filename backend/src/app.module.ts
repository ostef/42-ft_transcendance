import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt_auth.guard";
import { ChatModule } from "./chat/chat.module";

import { UserEntity } from "./users/entities/user.entity";
import { FriendRequestEntity } from "./users/entities/friend_request.entity";
import { ChannelEntity } from "./chat/entities/channel.entity";
import { MessageEntity } from "./chat/entities/message.entity";
import { ChannelInviteEntity } from "./chat/entities/channel_invite.entity";
import { PrivateConversationEntity } from "./chat/entities/private_conversation.entity";

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ChatModule,
        TypeOrmModule.forRoot ({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            entities: [
                UserEntity, FriendRequestEntity,
                ChannelEntity, ChannelInviteEntity, PrivateConversationEntity, MessageEntity,
            ],
            // This will modify the database according to the
            // definition of the entities
            synchronize: true,
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
