import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel, Message } from './entities';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService
{
	constructor(
		@InjectRepository(Channel)
		private channelRepository: Repository<Channel>,

		@InjectRepository(Message)
		private messageRepository: Repository<Message>,

		private usersService: UsersService
	){}

	async startChannel(users: User[], name: string, date: Date): Promise<void>
	{
		const conv = new Channel();
		conv.users = users;
		conv.dateCreated = date;
		conv.name = name;

		await this.channelRepository.save (conv);
	}

	async addUserToChannel(convId: number, username: string): Promise<boolean>
	{
		const conv = await this.channelRepository.findOneBy ({id: convId});
		if (!conv)
			return false;

		const user = await this.usersService.findOne (username);
		if (!user)
			return false;

		if (conv.users.includes (user))
			return false;

		conv.users.push (user);
		this.channelRepository.save (conv);
	}

	async removeUserFromChannel(convId: number, username: string): Promise<boolean>
	{
		return false;
	}

	async isUserInChannel(conv: Channel, user: User): Promise<boolean>
	{
		return false;
	}

	async sendMessage(from: User, to: Channel, date: Date, content: string): Promise<boolean>
	{
		return false;
	}
}
