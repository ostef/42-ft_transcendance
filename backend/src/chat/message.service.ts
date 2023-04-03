import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../users/user.entity";
import { Channel } from "./entities/channel.entity";
import { Message } from "./entities/message.entity";
import { UserToUser } from "./entities/user_to_user.entity";

@Injectable ()
export class MessageService
{
	constructor (
		@InjectRepository (Message)
		private messageRepository: Repository<Message>,

		@InjectRepository (UserToUser)
		private userToUserRepository: Repository<UserToUser>,
	){}

	sendToChannel (fromUser: User, toChannel: Channel, content: string)
	{
	}

	sendDirect (fromUser: User, toUser: User, content: string)
	{
	}
}
