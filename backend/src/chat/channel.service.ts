import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../users/user.entity";
import { Channel } from "./entities/channel.entity";
import { Message } from "./entities/message.entity";

type ChannelParams = {
	ownerId: number;
	name: string;
	password: string;
}

@Injectable ()
export class ChannelService
{
	constructor (
		@InjectRepository (Channel)
		private channelRepository: Repository<Channel>,
	){}

	async findChannelsByName (name: string): Promise<Channel[]>
	{
		return this.channelRepository.findBy ({name: name});
	}

	async createChannel (params: ChannelParams): Promise<Channel>
	{
		const newChannel = this.channelRepository.create ();
		//newChannel.users.push (user);

		return this.channelRepository.save (newChannel);
	}

	deleteChannel (channelId: number): void
	{
	}
}
