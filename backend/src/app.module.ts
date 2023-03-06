import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { Channel, Message } from './chat/entities';

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
      entities: [User, Channel, Message],
      //TODO: Change to false in production
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
