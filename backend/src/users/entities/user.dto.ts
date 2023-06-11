import { PartialType, PickType } from "@nestjs/mapped-types";
import { validateName, validatePassword, validatePngFilename } from "src/validation";

export class UserDto
{
    username: string;
    nickname: string;
    has2FA: boolean;
    avatarFile: string;

    validate ()
    {
        if (!validateName (this.username))
            throw new Error ("Invalid username");

        if (!validateName (this.nickname))
            throw new Error ("Invalid nickname");

        if (!validatePngFilename (this.avatarFile))
            throw new Error ("Avatar file must be a PNG file");
    }
}

export class CreateUserDto
{
    username: string;
    nickname: string;
    password: string;

    validate ()
    {
        if (!validateName (this.username))
            throw new Error ("Invalid username");

        if (!validateName (this.nickname))
            throw new Error ("Invalid nickname");

        if (!validatePassword (this.password))
            throw new Error ("Password too weak");
    }
}

export class UpdateUserDto
{
    username?: string;
    nickname?: string;
    has2FA?: boolean;
    avatarFile?: string;
    password?: string;

    friendsToRemove?: string[];
    usersToBlock?: string[];
    usersToUnblock?: string[];

    validate ()
    {
        if (this.username != undefined && !validateName (this.username))
            throw new Error ("Invalid username");

        if (this.nickname != undefined && !validateName (this.nickname))
            throw new Error ("Invalid nickname");

        if (this.password != undefined && !validatePassword (this.password))
            throw new Error ("Password too weak");

        if (this.avatarFile != undefined && !validatePngFilename (this.avatarFile))
            throw new Error ("Avatar file must be a PNG file");
    }
}
