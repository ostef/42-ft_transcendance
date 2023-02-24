import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Message } from './chat.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService
{
	constructor(
		@InjectRepository(Conversation)
		private conversationRepository: Repository<Conversation>,

		@InjectRepository(Message)
		private messageRepository: Repository<Message>,

		private usersService: UsersService
	){}

	async startConversation(users: User[], name: string, date: Date): Promise<void>
	{
		const conv = new Conversation();
		conv.users = users;
		conv.dateCreated = date;
		conv.name = name;

		await this.conversationRepository.save (conv);
	}

	async addUserToConversation(convId: number, username: string): Promise<boolean>
	{
		const conv = await this.conversationRepository.findOneBy ({id: convId});
		if (!conv)
			return false;

		const user = await this.usersService.findOne (username);
		if (!user)
			return false;

		if (conv.users.includes (user))
			return false;

		conv.users.push (user);
		this.conversationRepository.save (conv);
	}

	async removeUserFromConversation(convId: number, username: string): Promise<boolean>
	{
		return false;
	}

	async isUserInConversation(conv: Conversation, user: User): Promise<boolean>
	{
		return false;
	}

	async sendMessage(from: User, to: Conversation, date: Date, content: string): Promise<boolean>
	{
		return false;
	}
}
