import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length } from "class-validator";

import { UserDto } from "src/users/types";
import { ChannelEntity } from "./entities/channel.entity";
import { ChannelInviteEntity } from "./entities/channel_invite.entity";
import { UserEntity } from "src/users/entities/user.entity";
import { MessageEntity } from "./entities/message.entity";

export class MinimalChannelDto
{
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isPasswordProtected: boolean;

    static fromChannelEntity (channel: ChannelEntity): MinimalChannelDto
    {
        return {
            id: channel.id,
            name: channel.name,
            description: channel.description,
            isPrivate: channel.isPrivate,
            isPasswordProtected: channel.hashedPassword != null
        };
    }
}

export class ChannelDto extends MinimalChannelDto
{
    ownerId: string;
    adminIds: string[];
    mutedUserIds: string[];

    static fromChannelEntity (channel: ChannelEntity): ChannelDto
    {
        return {
            id: channel.id,
            name: channel.name,
            description: channel.description,
            isPrivate: channel.isPrivate,
            isPasswordProtected: channel.hashedPassword != null,
            ownerId: channel.owner.id,
            adminIds: channel.administrators.map ((val) => val.id),
            mutedUserIds: channel.mutedUsers.map ((val) => val.id)
        };
    }
}

export class ChannelInviteDto
{
    id: string;
    channel?: MinimalChannelDto;   // If the channel has been deleted then this will be undefined
    accepted: boolean;
    expirationDate: Date;

    static fromChannelInviteEntity (invite: ChannelInviteEntity): ChannelInviteDto
    {
        return {
            id: invite.id,
            channel: invite.channel ? MinimalChannelDto.fromChannelEntity (invite.channel) : undefined,
            accepted: invite.accepted,
            expirationDate: invite.expirationDate,
        };
    }
}

export class MessageDto
{
    sender: UserDto;
    toChannel?: ChannelDto;
    toUser?: UserDto;
    content: string;
    channelInvite?: ChannelInviteDto;
    gameId?: string;
    date: Date;

    static fromMessageEntity (me: UserEntity, msg: MessageEntity): MessageDto
    {
        if (msg.fromUser.hasBlocked (me) || me.hasBlocked (msg.fromUser.id))
        {
            return {
                sender: UserDto.fromUserEntity (me, msg.fromUser),
                content: "You cannot see this message because this user has blocked you",
                date: msg.timestamp,
            };
        }
        else
        {
            return {
                sender: UserDto.fromUserEntity (me, msg.fromUser),
                content: msg.fromUser.hasBlocked (me) ? '' : msg.content,
                date: msg.timestamp,
                channelInvite: msg.invite ? ChannelInviteDto.fromChannelInviteEntity (msg.invite) : undefined,
                gameId: msg.gameId,
            };
        }
    }
}

export class CreateChannelParams
{
    @IsString ()
    @Length (2, 100)
    name: string;

    @IsString ()
    @IsNotEmpty ()
    description: string;

    @IsBoolean ()
    isPrivate: boolean;

    @IsOptional ()
    @IsStrongPassword ({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
    password?: string;
}

export class UpdateChannelParams
{
    @IsOptional ()
    @IsString ()
    @Length (2, 100)
    name?: string;

    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    description?: string;

    @IsOptional ()
    @IsBoolean ()
    isPrivate?: boolean;

    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    passwordForAuth?: string;

    @IsOptional ()
    @IsBoolean ()
    removePassword?: boolean;

    @IsOptional ()
    @IsStrongPassword ({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
    password?: string;

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToAdmin?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToUnadmin?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToBan?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToUnban?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToMute?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToUnmute?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToKick?: string[];
}

export class LeaveChannelParams
{
    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    newOwnerId?: string;
}

export class MessageParams
{
    @IsString ()
    @IsNotEmpty ()
    toUser: string;

    @IsString ()
    @IsNotEmpty ()
    toChannel: string;

    @IsString ()
    @IsNotEmpty ()
    content: string;
}

export class ChannelInviteParams
{
    @IsString ()
    @IsNotEmpty ()
    userId: string;

    @IsString ()
    @IsNotEmpty ()
    message: string;
}
