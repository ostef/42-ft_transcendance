import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";
import { IsPassword } from "src/utils/is_password.validator";
import { IsName } from "src/utils/is_name.validator";

export class UserDto
{
    @IsNotEmpty ()
    @IsName ({message: "invalid username"})
    username: string;

    @IsNotEmpty ()
    @IsName ({message: "invalid nickname"})
    nickname: string;

    @IsNotEmpty ()
    has2FA: boolean;

    @IsNotEmpty ()
    avatarFile: string;
}

export class CreateUserDto extends PickType (UserDto, ["username", "nickname"] as const)
{
    @IsNotEmpty ()
    @IsPassword ({message: "password too weak"})
    password: string;
}

export class UpdateUserDto extends PartialType (UserDto)
{
    @IsNotEmpty ()
    @IsPassword ({message: "password too weak"})
    password?: string;

    friendsToRemove?: string[];
    usersToBlock?: string[];
    usersToUnblock?: string[];
}
