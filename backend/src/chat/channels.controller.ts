import {
    Controller, Logger,
    Get, Post, Put, Body, Param, Delete,
    BadRequestException, NotFoundException, UseGuards,
    Request,
} from "@nestjs/common";

import { ChannelsService } from "./channels.service";
import { MessageService } from "./message.service";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/user.entity";

import {
    MinimalChannelDto, ChannelDto, MessageDto,
    CreateChannelParams, UpdateChannelParams, LeaveChannelParams, ChannelInviteParams
} from "./types";

import { UserDto } from "src/users/types";

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
    async getAllPublicChannels (): Promise<MinimalChannelDto[]>
    {
        const channels = await this.channelService.findMultipleChannels ({isPrivate: false});

        const result = [] as MinimalChannelDto[];
        for (const chan of channels)
        {
            result.push (MinimalChannelDto.fromChannelEntity (chan));
        }

        return result;
    }

    @Get ("joined")
    async getJoinedChannels (@Request () req): Promise<ChannelDto[]>
    {
        const user = await this.userService.findUserEntity (
            {id: req.user.id},
            {joinedChannels: {owner: true, administrators: true, mutedUsers: true }}
        );

        const result = [] as ChannelDto[];
        for (const chan of user.joinedChannels)
        {
            result.push (ChannelDto.fromChannelEntity (chan));
        }

        return result;
    }

    @Get (":id/users")
    async getChannelUsers (@Request () req, @Param ("id") id: string): Promise<UserDto[]>
    {
        const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});

        const channel = await this.channelService.findChannelEntity ({id: id}, {users: {blockedUsers: true}});
        if (!channel)
            throw new BadRequestException ("Channel does not exist");

        if (!channel.hasUser (req.user.id))
            throw new BadRequestException ("You are not in this channel");

        const result = [] as UserDto[];
        for (const user of channel.users)
        {
            result.push (UserDto.fromUserEntity (me, user));
        }

        result.sort ((a, b) => a.nickname.localeCompare (b.nickname));

        return result;
    }

    @Get (":id/messages")
    async getChannelMessages (@Request () req, @Param ("id") id: string): Promise<MessageDto[]>
    {
        const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});

        const channel = await this.channelService.findChannelEntity ({id: id}, {users: true, messages: {fromUser: {blockedUsers: true}}});
        if (!channel)
            throw new BadRequestException ("Channel does not exist");

        if (!channel.hasUser (req.user.id))
            throw new BadRequestException ("You are not in this channel");

        const result = [] as MessageDto[];
        for (const msg of channel.messages)
        {
            if (!msg.fromUser.hasBlocked (me) && !me.hasBlocked (msg.fromUser.id))
                result.push (MessageDto.fromMessageEntity (me, msg));
        }

        result.sort ((a, b) => a.date.getTime () - b.date.getTime ());

        return result;
    }

    // @Todo: move this route to its own controller?
    @Get ("discussions")
    async getPrivateConversations (@Request () req): Promise<UserDto[]>
    {
        try
        {
            const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});

            const convs = await this.msgService.findPrivateConversations (req.user.id,
                {firstUser: {blockedUsers: true}, secondUser: {blockedUsers: true}});

            const result = [] as UserDto[];
            for (const conv of convs)
            {
                if (conv.firstUser.id == me.id)
                    result.push (UserDto.fromUserEntity (me, conv.secondUser));
                else
                    result.push (UserDto.fromUserEntity (me, conv.firstUser));
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
            await this.msgService.sendMessageToUser (req.user.id, otherId, message);
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Get ("discussions/:id")
    async getPrivateMessages (@Request () req, @Param ("id") otherId: string): Promise<MessageDto[]>
    {
        try
        {
            const me = await this.userService.findUserEntity ({id: req.user.id}, {friends: true, blockedUsers: true});
            const other = await this.userService.findUserEntity ({id: otherId}, {blockedUsers: true});

            if (other.hasBlocked (me))
                return [];

            if (me.hasBlocked (other.id))
                return [];

            const conv = await this.msgService.findPrivConversation (req.user.id, otherId, {messages: {fromUser: {blockedUsers: true}, invite: true}});

            if (!conv)
                return [];

            const result = [] as MessageDto[];
            for (const msg of conv.messages)
                result.push (MessageDto.fromMessageEntity (me, msg));

            result.sort ((a, b) => a.date.getTime () - b.date.getTime ());

            return result;
        }
        catch (err)
        {
            this.logger.error (err.stack);
            throw new BadRequestException (err.message);
        }
    }

    @Post ()
    async createChannel (@Request () req, @Body () body: CreateChannelParams): Promise<string>
    {
        try
        {
            const chan = await this.channelService.createChannel (req.user.id, body);

            return chan.id;
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
    async getChannelInfo (@Request () req, @Param ("id") id: string, @Body () body: UpdateChannelParams): Promise<ChannelDto>
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
    async updateChannel (@Request () req, @Param ("id") id: string, @Body () body: UpdateChannelParams)
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
    async leaveChannel (@Request () req, @Param ("id") id: string, @Body () body: LeaveChannelParams)
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

    @Post (":id/invite")
    async inviteToChannel (@Request () req, @Param ("id") id: string, @Body () body: ChannelInviteParams)
    {
        try
        {
            const invite = await this.channelService.inviteToChannel (req.user.id, body.userId, id);
            await this.msgService.sendMessageToUser (req.user.id, body.userId, body.message, invite);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Post ("invite/:id/accept")
    async acceptChannelInvite (@Request () req, @Param ("id") id: string)
    {
        try
        {
            await this.channelService.acceptInvite (req.user.id, id);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }
}
