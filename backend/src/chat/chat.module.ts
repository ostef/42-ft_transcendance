import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message } from './chat.entity';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([Conversation, Message])
	],
	providers: [],
	exports: [],
})
export class ChatModule {}
