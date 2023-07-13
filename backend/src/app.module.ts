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


import { GameModule } from './game/game.module';
import { gameHistoryEntity } from "./game/entities/gameHistory.entity";

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ChatModule,
        TypeOrmModule.forRoot ({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [UserEntity, PrivateConversationEntity, MessageEntity, ChannelEntity, FriendRequestEntity, ChannelInviteEntity, gameHistoryEntity],
            synchronize: true,
        }),
        GameModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
