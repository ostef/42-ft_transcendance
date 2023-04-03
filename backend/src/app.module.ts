import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';

import { Friendship, User } from './users/user.entity';

import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { Conversation, Message } from './chat/chat.entity';
import { FilesModule } from './files/files.module';

import * as process from 'process';

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
      entities: ["users/*.entity.ts", "chat/entities/*.ts" ],
      
      //TODO: Change to false in production
      synchronize: true,
    }),
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
