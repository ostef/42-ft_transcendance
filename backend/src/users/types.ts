import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserParams
{
    @IsString ()
    // @IsName ()
    username: string;

    @IsString ()
    // @IsName ()
    nickname: string;

    @IsString ()
    // @IsPassword ()
    password: string;
}

export class UpdateUserParams
{
    @IsOptional ()
    @IsString ()
    // @IsName ()
    username?: string;

    @IsOptional ()
    @IsString ()
    // @IsName ()
    nickname?: string;

    @IsOptional ()
    @IsString ()
    // @IsPassword ()
    password?: string;

    @IsOptional ()
    @IsString ()
    has2FA?: string;

    @IsOptional ()
    @IsString ()
    @IsNotEmpty ()
    avatarFile?: string;

    friendsToRemove?: string[];
    usersToBlock?: string[];
    usersToUnblock?: string[];
}

export class ReceivedFriendRequestParams
{
    @IsString ()
    @IsNotEmpty ()
    fromUser: string;
}

export class SentFriendRequestParams
{
    @IsString ()
    @IsNotEmpty ()
    toUser: string;
}
