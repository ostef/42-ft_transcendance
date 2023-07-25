import { IsAlphanumeric, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length } from "class-validator";
import { IsName, IsPngFilename } from "src/validation";

export class CreateUserParams
{
    @IsAlphanumeric ()
    @Length (2, 50)
    username: string;

    @IsString ()
    @Length (2, 50)
    nickname: string;

    @IsStrongPassword ({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
    password: string;
}

export class UpdateUserParams
{
    @IsOptional ()
    @IsAlphanumeric ()
    @Length (2, 50)
    username?: string;

    @IsOptional ()
    @IsString ()
    @Length (2, 50)
    nickname?: string;

    @IsOptional ()
    @IsStrongPassword ({minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
    password?: string;

    @IsOptional ()
    @IsBoolean ()
    has2FA?: boolean;

    @IsOptional ()
    @IsString ()
    @IsPngFilename ()
    avatarFile?: string;

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    friendsToRemove?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
    usersToBlock?: string[];

    @IsOptional ()
    @IsArray ()
    @IsString ({each: true})
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
