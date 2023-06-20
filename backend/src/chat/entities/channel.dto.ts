import { PartialType, OmitType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class CreateChannelDto
{
    @IsNotEmpty ()
    name: string;

    @IsNotEmpty ()
    description: string;

    @IsNotEmpty ()
    isPrivate: boolean;

    password?: string;
}

export class UpdateChannelDto extends
    PartialType (CreateChannelDto)
{
    usersToAdmin?: string[];
    usersToUnadmin?: string[];
    usersToBan?: string[];
    usersToUnban?: string[];
    usersToMute?: string[];
    usersToUnmute?: string[];
    usersToKick?: string[];
}

export class LeaveChannelDto
{
    @IsNotEmpty ()
    newOwnerId?: string;
}

export class MessageDto
{
    @IsNotEmpty ()
    toUser: string;

    @IsNotEmpty ()
    toChannel: string;

    @IsNotEmpty ()
    content: string;
}
