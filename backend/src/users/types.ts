import { IsAlphanumeric, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length } from "class-validator";
import { IsName, IsPngFilename } from "src/validation";
import { UserEntity } from "./entities/user.entity";
import { FriendRequestEntity } from "./entities/friend_request.entity";

export class UserDto
{
    id: string;
    username: string;
    nickname: string;
    avatarFile: string;
    isFriend: boolean;
    isBlocked: boolean;
    hasBlockedYou: boolean;

    static fromUserEntity (me: UserEntity, entity: UserEntity): UserDto
    {
        return {
            id: entity.id,
            avatarFile: entity.avatarFile,
            username: entity.username,
            nickname: entity.nickname,
            isFriend: me.isFriendsWith (entity),
            isBlocked: me.hasBlocked (entity),
            hasBlockedYou: entity.hasBlocked (me)
        };
    }
}

export class LoggedUserDto
{
    id: string;
    username: string;
    nickname: string;
    avatarFile: string;
    receivedFriendRequests: string[];

    static fromUserEntityAndFriendRequests (entity: UserEntity, requests: FriendRequestEntity[]): LoggedUserDto
    {
        return {
            id: entity.id,
            username: entity.username,
            nickname: entity.nickname,
            avatarFile: entity.avatarFile,
            receivedFriendRequests: requests.map ((val) => val.fromUser.id),
        };
    }
}

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
    @IsNotEmpty ()
    twoFactorSecret?: string;

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
