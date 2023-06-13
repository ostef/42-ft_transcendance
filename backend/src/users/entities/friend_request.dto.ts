import { OmitType } from "@nestjs/mapped-types";

export class FriendRequestDto
{
    fromUser: string;
    toUser: string;

    static validate (value: FriendRequestDto)
    {
        if (value.fromUser != undefined && value.fromUser.length <= 0)
            throw new Error ("fromUser should not be empty");

        if (value.toUser != undefined && value.toUser.length <= 0)
            throw new Error ("toUser should not be empty");
    }
}

export class ReceivedFriendRequestDto extends OmitType (FriendRequestDto, ["toUser"]) {}
export class SentFriendRequestDto extends OmitType (FriendRequestDto, ["fromUser"]) {}
