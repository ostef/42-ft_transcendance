import { PartialType, PickType } from "@nestjs/mapped-types";
import { validateName, validatePassword, validatePngFilename } from "src/validation";

export class UserDto
{
    username: string;
    nickname: string;
    has2FA: boolean;
    twoFactorSecret: string;
    avatarFile: string;

    static validate (value: UserDto)
    {
        console.log(value.username)
        if (!validateName (value.username))
            throw new Error ("Invalid username");

        if (!validateName (value.nickname))
            throw new Error ("Invalid nickname");

        if (!validatePngFilename (value.avatarFile))
            throw new Error ("Avatar file must be a PNG file");
    }
}

export class CreateUserDto
{
    username: string;
    nickname: string;
    password: string;

    static validate (value: CreateUserDto)
    {
        if (!validateName (value.username))
            throw new Error ("Invalid username");

        if (!validateName (value.nickname))
            throw new Error ("Invalid nickname");

        if (!validatePassword (value.password))
            throw new Error ("Password too weak");
    }
}

export class UpdateUserDto
{
    username?: string;
    nickname?: string;
    has2FA?: boolean;
    twoFactorSecret?: string;
    avatarFile?: string;
    password?: string;

    friendsToRemove?: string[];
    usersToBlock?: string[];
    usersToUnblock?: string[];

    static validate (value: UpdateUserDto)
    {
        if (value.username != undefined && !validateName (value.username))
            throw new Error ("Invalid username");

        if (value.nickname != undefined && !validateName (value.nickname))
            throw new Error ("Invalid nickname");

        if (value.password != undefined && !validatePassword (value.password))
            throw new Error ("Password too weak");

        if (value.avatarFile != undefined && !validatePngFilename (value.avatarFile))
            throw new Error ("Avatar file must be a PNG file");
    }
}
