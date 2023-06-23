import {
    Controller, Logger,
    Get, Post, Put, Body, Param, Delete,
    BadRequestException, NotFoundException, UseGuards,
    Request,
} from "@nestjs/common";

import { ChannelsService } from "./channels.service";
import { CreateChannelDto, LeaveChannelDto, MessageDto, UpdateChannelDto } from "./entities/channel.dto";
import { MessageService } from "./message.service";
import { JwtAuthGuard } from "src/auth/jwt_auth.guard";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/user.entity";

import { MinimalChannelInfo, ChannelInfo } from "./channels.service";

class UserInfo
{
    id: string;
    username: string;
    nickname: string;
    avatarFile: string;
    isBlocked: boolean;
    isFriend: boolean;

    static fromUserEntity (me: UserEntity, entity: UserEntity): UserInfo
    {
        return {
            id: entity.id,
            avatarFile: entity.avatarFile,
            username: entity.username,
            nickname: entity.nickname,
            isFriend: me.isFriendsWith (entity),
            isBlocked: me.hasBlocked (entity),
        };
    }
}

class MessageInfo
{
    sender: UserInfo;
    content: string;
    date: Date;
}

@Controller ("channels")
export class ChannelsController
{
    private logger: Logger = new Logger ("ChannelsController");

    constructor (
        private userService: UsersService,
        private channelService: ChannelsService,
        private msgService: MessageService,
    ) {}

    @Get ("public")
    async getAllPublicChannels (): Promise<MinimalChannelInfo[]>
    {
        const channels = await this.channelService.findMultipleChannels ({isPrivate: false});

        const result = [] as MinimalChannelInfo[];
        for (const chan of channels)
        {
            const info: MinimalChannelInfo = {
                id: chan.id,
                name: chan.name,
                description: chan.description,
                isPasswordProtected: chan.password != null,
                isPrivate: false,
            };

            result.push (info);
        }

        return result;
    }

    @Get ("joined")
    async getJoinedChannels (@Request () req): Promise<ChannelInfo[]>
    {
        const user = await this.userService.findUserEntity (
            {id: req.user.id},
            {joinedChannels: {owner: true, administrators: true, mutedUsers: true }}
        );

        const result = [] as ChannelInfo[];
        for (const chan of user.joinedChannels)
        {
            result.push ({
                id: chan.id,
                name: chan.name,
                description: chan.description,
                isPrivate: chan.isPrivate,
                isPasswordProtected: chan.password != null,
                ownerId: chan.owner.id,
                adminIds: chan.administrators.map ((val) => val.id),
                mutedUserIds: chan.mutedUsers.map ((val) => val.id),
            });
        }

        return result;
    }

    @Get (":id/users")
    async getChannelUsers (@Request () req, @Param ("id") id: string): Promise<any[]>
    {
        const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});

        const channel = await this.channelService.findChannelEntity ({id: id}, {users: true});
        if (!channel)
            throw new BadRequestException ("Channel does not exist");

        if (!channel.hasUser (req.user.id))
            throw new BadRequestException ("You are not in this channel");

        const result = [] as UserInfo[];
        for (const user of channel.users)
        {
            result.push (UserInfo.fromUserEntity (me, user));
        }

        result.sort ((a, b) => a.nickname.localeCompare (b.nickname));

        return result;
    }

    @Get (":id/messages")
    async getChannelMessages (@Request () req, @Param ("id") id: string): Promise<MessageInfo[]>
    {
        const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});

        const channel = await this.channelService.findChannelEntity ({id: id}, {users: true, messages: {fromUser: true}});
        if (!channel)
            throw new BadRequestException ("Channel does not exist");

        if (!channel.hasUser (req.user.id))
            throw new BadRequestException ("You are not in this channel");

        const result = [] as MessageInfo[];
        for (const msg of channel.messages)
        {
            result.push ({
                sender: UserInfo.fromUserEntity (me, msg.fromUser),
                content: msg.content,
                date: msg.timestamp,
            });
        }

        return result;
    }

    // @Todo: move this route to its own controller?
    @Get ("discussions")
    async getPrivateConversations (@Request () req)
    {
        try
        {
            const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});

            const convs = await this.msgService.findPrivateConversations (req.user.id);

            const result = [] as UserInfo[];
            for (const conv of convs)
            {
                if (conv.firstUser.id == me.id)
                    result.push (UserInfo.fromUserEntity (me, conv.secondUser));
                else
                    result.push (UserInfo.fromUserEntity (me, conv.firstUser));
            }

            return result;
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Post ("discussions/:id")
    async sendPrivateMessage (@Request () req, @Param ("id") otherId: string, message: string)
    {
        try
        {
            const me = await this.userService.findUserEntity ({id: req.user.id});

            await this.msgService.sendMessageToUser (req.user.id, otherId, message);
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Get ("discussions/:id")
    async getPrivateMessages (@Request () req, @Param ("id") otherId: string)
    {
        try
        {
            const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});
            const conv = await this.msgService.findPrivConversation (req.user.id, otherId, {messages: {fromUser: true}});

            if (!conv)
                return [];

            const result = [] as MessageInfo[];
            for (const msg of conv.messages)
            {
                result.push ({
                    sender: UserInfo.fromUserEntity (me, msg.fromUser),
                    content: msg.content,
                    date: msg.timestamp,
                });
            }

            return result;
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Post ()
    async createChannel (@Request () req, @Body () body: CreateChannelDto)
    {
        try
        {
            await this.channelService.createChannel (req.user.id, body);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Delete (":id")
    async deleteChannel (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.channelService.deleteChannel (req.user.id, id);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Post (":id")
    async sendMessageToChannel (@Request () req, @Param ("id") id: string, @Body () body: string)
    {
        try
        {
            await this.msgService.sendMessageToChannel (req.user.id, id, body);
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Get (":id")
    async getChannelInfo (@Request () req, @Param ("id") id: string, @Body () body: UpdateChannelDto)
    {
        try
        {
            const info = await this.channelService.getChannelInfo (req.user.id, id);

            return info;
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Put (":id")
    async updateChannel (@Request () req, @Param ("id") id: string, @Body () body: UpdateChannelDto)
    {
        try
        {
            await this.channelService.updateChannel (req.user.id, id, body);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Post (":id/join")
    async joinChannel (@Request () req, @Param ("id") id: string, @Body () body : any)
    {
        try
        {
            await this.channelService.joinChannel (id, req.user.id, body.password);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Post (":id/leave")
    async leaveChannel (@Request () req, @Param ("id") id: string, @Body () body: LeaveChannelDto)
    {
        try
        {
            await this.channelService.leaveChannel (id, req.user.id, body.newOwnerId);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }
}
