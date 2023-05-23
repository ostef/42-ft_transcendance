import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChatGateway } from "./chat.gateway";
import { ChannelEntity } from "./entities/channel.entity";
import { PrivateConversationEntity } from "./entities/private_conversation.entity";
import { MessageEntity } from "./entities/message.entity";
import { InviteEntity } from "./entities/invite.entity";
import { ChannelsService } from "./channels.service";
import { ChannelsController } from "./channels.controller";
import { MessageService } from "./message.service";
import { UsersModule } from "src/users/users.module";

@Module ({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature ([
            ChannelEntity, PrivateConversationEntity,
            MessageEntity, InviteEntity,
        ]),
    ],
    controllers: [ChannelsController],
    providers: [ChatGateway, ChannelsService, MessageService],
})
export class ChatModule {}
