import { OmitType } from "@nestjs/mapped-types";

export class FriendRequestDto
{
    fromUser: string;
    toUser: string;

    validate ()
    {
        if (this.fromUser != undefined && this.fromUser.length <= 0)
            throw new Error ("fromUser should not be empty");

        if (this.toUser != undefined && this.toUser.length <= 0)
            throw new Error ("toUser should not be empty");
    }
}

export class ReceivedFriendRequestDto extends OmitType (FriendRequestDto, ["toUser"]) {}
export class SentFriendRequestDto extends OmitType (FriendRequestDto, ["fromUser"]) {}
