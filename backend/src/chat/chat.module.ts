import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from './entities';
import { UsersModule } from '../users/users.module';
import { ChatGateway } from './chat.gateway';

@Module({
	imports: [
		UsersModule,
		TypeOrmModule.forFeature([Channel, Message])
	],
	providers: [ChatGateway],
	exports: [],
})
export class ChatModule {}
