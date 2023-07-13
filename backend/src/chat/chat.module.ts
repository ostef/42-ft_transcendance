import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChatGateway } from "./chat.gateway";
import { ChannelEntity } from "./entities/channel.entity";
import { PrivateConversationEntity } from "./entities/private_conversation.entity";
import { MessageEntity } from "./entities/message.entity";
import { ChannelInviteEntity } from "./entities/channel_invite.entity";
import { ChannelsService } from "./channels.service";
import { ChannelsController } from "./channels.controller";
import { MessageService } from "./message.service";
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";

@Module ({
    imports: [
        UsersModule,
        AuthModule,
        TypeOrmModule.forFeature ([
            ChannelEntity, PrivateConversationEntity,
            MessageEntity, ChannelInviteEntity,
        ]),
    ],
    controllers: [ChannelsController],
    providers: [ChannelsService, ChatGateway, MessageService],
})
export class ChatModule {}
