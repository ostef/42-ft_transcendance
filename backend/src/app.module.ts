import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';

import * as process from 'process';
import { ChannelInvite } from './chat/entities/invite.entity';
import { Friendship, User } from './users/user.entity';
import { Channel } from './chat/entities/channel.entity';
import { Message } from './chat/entities/message.entity';
import { UserToUser } from './chat/entities/user_to_user.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'database',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Channel, Message, UserToUser, ChannelInvite, Friendship],

      //TODO: Change to false in production
      synchronize: true,
    }),
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
