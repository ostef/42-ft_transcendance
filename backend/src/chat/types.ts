import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserDto
{
    id: string;
    username: string;
    nickname: string;
    avatarFile: string;
    isFriend: boolean;
    isBlocked: boolean;
    hasBlockedYou: boolean;
}

export class ChannelDto
{
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isPasswordProtected: boolean;
    ownerId?: string;
    adminIds?: string[];
    mutedUserIds?: string[];
}

export class ChannelInviteDto
{
    id: string;
    channel: ChannelDto;
    accepted: boolean;
    expirationDate: Date;
}

export class MessageDto
{
    sender: UserDto;
    toChannel?: ChannelDto;
    toUser?: UserDto;
    content: string;
    channelInvite?: ChannelInviteDto;
    date: Date;
}

export class CreateChannelParams
{
    @IsString ()
    @IsNotEmpty ()
    name: string;

    @IsString ()
    @IsNotEmpty ()
    description: string;

    @IsString ()
    @IsNotEmpty ()
    isPrivate: boolean;

    @IsOptional ()
    @IsString ()
    // @IsPassword ()
    password?: string;
}

export class UpdateChannelParams
{
    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    name?: string;

    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    description?: string;

    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    isPrivate?: boolean;

    @IsOptional ()
    @IsString ()
    // @IsPassword ()
    password?: string;

    usersToAdmin?: string[];
    usersToUnadmin?: string[];
    usersToBan?: string[];
    usersToUnban?: string[];
    usersToMute?: string[];
    usersToUnmute?: string[];
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
    content: string;
}

export class ChannelInviteParams
{
    @IsString ()
    @IsNotEmpty ()
    userId: string;

    @IsString ()
    message: string;
}
