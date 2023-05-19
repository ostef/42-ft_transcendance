import {
    Controller, Logger,
    Get, Post, Put, Body, Param, Delete,
    BadRequestException, NotFoundException, UseGuards,
    Request,
} from "@nestjs/common";

import { ChannelService } from "./channel.service";
import { CreateChannelDto, InviteDto, MessageDto } from "./entities/channel.dto";
import { MessageService } from "./message.service";
import { JwtAuthGuard } from "src/auth/jwt_auth.guard";

class MinimalChannelInfo
{
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isPasswordProtected: boolean;
}

class ChannelInfo extends MinimalChannelInfo
{
    ownerId: string;
    admins: string[];
    mutedUsers: string[];
}

@Controller ("channels")
export class ChannelsController
{
    private logger: Logger = new Logger ("ChannelsController");

    constructor (
        private channelService: ChannelService,
        private msgService: MessageService,
    ) {}

    @Get ("all")
    async getAllPublicChannels (): Promise<MinimalChannelInfo[]>
    {
        const channels = await this.channelService.findMultipleChannels ({isPrivate: false});

        const result = [] as MinimalChannelInfo[];
        for (const chan of channels)
        {
            let info : MinimalChannelInfo;
            info.id = chan.id;
            info.name = chan.name;
            info.description = chan.description;
            info.isPasswordProtected = chan.password != null;
            info.isPrivate = false;
            result.push (info);
        }

        return result;
    }

    @Get (":id/messages")
    async getChannelMessages (@Param ("id") id: string): Promise<MessageDto[]>
    {
        return [] as MessageDto[];
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

    @Post (":id")
    async sendMessageToChannel (@Request () req, @Param ("id") id: string, @Body () body: string)
    {
        try
        {
            await this.msgService.sendMessageToChannel (req.user.id, id, body);
        }
        catch (err)
        {
            this.logger.error (err);
            throw new BadRequestException (err.message);
        }
    }

    @Put (":id/join")
    async joinChannel (@Param ("id") id: string, @Body () body : any)
    {

    }

    @Post (":id/invite")
    async inviteToChannel (@Param ("id") id: string, @Body () body : InviteDto)
    {

    }
}
