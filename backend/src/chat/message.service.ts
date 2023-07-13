import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, Repository } from "typeorm";

import { ChannelEntity } from "./entities/channel.entity";
import { ChannelInviteEntity } from "./entities/channel_invite.entity";
import { CreateChannelDto, UpdateChannelDto } from "./entities/channel.dto";
import { ChannelsService } from "./channels.service";

import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/user.entity";
import { MessageEntity } from "./entities/message.entity";
import { PrivateConversationEntity } from "./entities/private_conversation.entity";

@Injectable ()
export class MessageService
{
    constructor (
        @InjectRepository (MessageEntity)
        private messageRepository: Repository<MessageEntity>,

        @InjectRepository (PrivateConversationEntity)
        private privConvRepository: Repository<PrivateConversationEntity>,

        private usersService: UsersService,
        private channelService: ChannelsService,
    ) {}

    async findPrivConversation (firstId: string, secondId: string, relations: FindOptionsRelations<PrivateConversationEntity> = {}): Promise<PrivateConversationEntity>
    {
        if (relations.firstUser == undefined)
            relations.firstUser = true;

        if (relations.secondUser == undefined)
            relations.secondUser = true;

        const firstKey = firstId.localeCompare (secondId) < 0 ? firstId : secondId;
        const secondKey = firstId.localeCompare (secondId) < 0 ? secondId : firstId;
        let conv = await this.privConvRepository.findOne ({
            where: {firstUser: {id: firstKey}, secondUser: {id: secondKey}},
            relations: relations
        });

        return conv;
    }

    async findOrCreatePrivConversation (first: UserEntity, second: UserEntity, relations: FindOptionsRelations<PrivateConversationEntity> = {}): Promise<{conv: PrivateConversationEntity, newConv: boolean}>
    {
        if (relations.firstUser == undefined)
            relations.firstUser = true;

        if (relations.secondUser == undefined)
            relations.secondUser = true;

        const firstKey = first.id.localeCompare (second.id) < 0 ? first : second;
        const secondKey = first.id.localeCompare (second.id) < 0 ? second : first;
        let conv = await this.privConvRepository.findOne ({
            where: {firstUser: {id: firstKey.id}, secondUser: {id: secondKey.id}},
            relations: relations
        });

        if (conv)
            return {conv: conv, newConv: false};

        conv = this.privConvRepository.create ({firstUser: firstKey, secondUser: secondKey});
        conv.firstUserId = firstKey.id;
        conv.secondUserId = secondKey.id;
        conv.firstUser = firstKey;
        conv.secondUser = secondKey;
        conv.messages = [];

        conv = await this.privConvRepository.save (conv);

        return {conv: conv, newConv: true};
    }

    async findPrivateConversations (userId: string, relations: FindOptionsRelations<PrivateConversationEntity> = {}): Promise<PrivateConversationEntity[]>
    {
        const conv1 = await this.privConvRepository.find ({where: {firstUserId: userId}, relations: relations});
        const conv2 = await this.privConvRepository.find ({where: {secondUserId: userId}, relations: relations});

        return conv1.concat (conv2);
    }

    async sendMessageToUser (senderId: string, userId: string, content: string, invite: ChannelInviteEntity = null): Promise<{msg: MessageEntity, conv: PrivateConversationEntity, newConv: boolean}>
    {
        const sender = await this.usersService.findUserEntity ({id: senderId}, {blockedUsers: true});
        if (!sender)
            throw new Error ("User does not exist");

        const receiver = await this.usersService.findUserEntity ({id: userId}, {blockedUsers: true});
        if (!receiver)
            throw new Error ("User  does not exist");

        if (receiver.hasBlocked (senderId))
            throw new Error ("User has blocked you");

        if (sender.hasBlocked (userId))
            throw new Error ("User is blocked");

        const {conv, newConv} = await this.findOrCreatePrivConversation (sender, receiver, {messages: true});

        let msg = this.messageRepository.create ();
        msg.fromUser = sender;
        msg.toPrivateConversation = conv;
        msg.content = content;
        if (invite)
            msg.invite = invite;

        msg = await this.messageRepository.save (msg);

        conv.messages.push (msg);

        await this.privConvRepository.save (conv);

        return {msg: msg, conv: conv, newConv: newConv};
    }

    async sendMessageToChannel (senderId: string, channelId: string, content: string, invite: ChannelInviteEntity = null): Promise<MessageEntity>
    {
        const sender = await this.usersService.findUserEntity ({id: senderId});
        if (!sender)
            throw new Error ("User does not exist");

        const channel = await this.channelService.findChannelEntity ({id: channelId}, {users: true, mutedUsers: true, messages: true});
        if (!channel)
            throw new Error ("Channel does not exist");

        if (!channel.hasUser (sender))
            throw new Error ("You are not in this channel");

        if (channel.isMuted (sender))
            throw new Error ("You are muted");

        let msg = this.messageRepository.create ();
        msg.fromUser = sender;
        msg.toChannel = channel;
        msg.content = content;
        if (invite)
            msg.invite = invite;

        msg = await this.messageRepository.save (msg);

        channel.messages.push (msg);

        await this.channelService.saveChannel (channel);

        return msg;
    }
}
