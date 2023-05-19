import { PartialType, PickType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";

export class FriendRequestDto
{
    @IsNotEmpty ()
    fromUser: string;

    @IsNotEmpty ()
    toUser: string;
}

export class ReceivedFriendRequestDto extends PickType (FriendRequestDto, ["fromUser"] as const) {}
export class SentFriendRequestDto extends PickType (FriendRequestDto, ["toUser"] as const) {}
