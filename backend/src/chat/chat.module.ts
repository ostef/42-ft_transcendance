import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { ChatGateway } from './chat.gateway';

import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { InviteService } from './invite.service';

import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { UserToUser } from './entities/user_to_user.entity';
import { ChannelInvite } from './entities/invite.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Channel, Message, ChannelInvite, UserToUser]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ChatGateway, ChannelService, MessageService, InviteService],
  exports: [],
})
export class ChatModule {}
