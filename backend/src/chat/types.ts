import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length } from "class-validator";

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
