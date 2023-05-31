import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsRelations, Repository } from "typeorm";

import { ChannelEntity } from "./entities/channel.entity";
import { InviteEntity } from "./entities/invite.entity";
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

    async findOrCreatePrivConversation (first: UserEntity, second: UserEntity, relations: FindOptionsRelations<PrivateConversationEntity> = {}): Promise<PrivateConversationEntity>
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
            return conv;

        conv = this.privConvRepository.create ({firstUser: firstKey, secondUser: secondKey});

        return await this.privConvRepository.save (conv);
    }

    async sendMessageToUser (senderId: string, userId: string, content: string, invite: InviteEntity = null)
    {
        const sender = await this.usersService.findUserEntity ({id: senderId}, {blockedUsers: true});
        if (!sender)
            throw new Error ("User " + senderId + " does not exist");

        const receiver = await this.usersService.findUserEntity ({id: userId}, {blockedUsers: true});
        if (!receiver)
            throw new Error ("User " + userId + " does not exist");

        if (receiver.hasBlocked (senderId))
            throw new Error ("User " + senderId + " is blocked");

        if (sender.hasBlocked (userId))
            throw new Error ("User " + userId + " is blocked");

        const conv = await this.findOrCreatePrivConversation (sender, receiver);

        let msg = this.messageRepository.create ();
        msg.fromUser = sender;
        msg.toPrivateConversation = conv;
        msg.content = content;
        if (invite)
            msg.invite = invite;

        msg = await this.messageRepository.save (msg);

        conv.messages.push (msg);

        await this.privConvRepository.save (conv);
    }

    async sendMessageToChannel (senderId: string, channelId: string, content: string, invite: InviteEntity = null)
    {
        const sender = await this.usersService.findUserEntity ({id: senderId});
        if (!sender)
            throw new Error ("User " + senderId + " does not exist");

        const channel = await this.channelService.findChannelEntity ({id: channelId}, {users: true, mutedUsers: true});
        if (!channel)
            throw new Error ("Channel " + channelId + " does not exist");

        if (!channel.hasUser (sender))
            throw new Error ("User " + senderId + " is not in channel " + channelId);

        if (channel.isMuted (sender))
            throw new Error ("User " + senderId + " is muted");

        let msg = this.messageRepository.create ();
        msg.fromUser = sender;
        msg.toChannel = channel;
        msg.content = content;
        if (invite)
            msg.invite = invite;

        msg = await this.messageRepository.save (msg);

        channel.messages.push (msg);

        await this.channelService.saveChannel (channel);
    }
}
