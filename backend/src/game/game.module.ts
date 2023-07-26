import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { TypeOrmModule } from "@nestjs/typeorm";
import { gameHistoryEntity } from './entities/gameHistory.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { FriendRequestEntity } from 'src/users/entities/friend_request.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelsService } from 'src/chat/channels.service';
import { ChannelEntity } from 'src/chat/entities/channel.entity';
import { ChannelInviteEntity } from 'src/chat/entities/channel_invite.entity';

@Module({
  imports: [
	AuthModule,
    TypeOrmModule.forFeature ([
      gameHistoryEntity, UserEntity, FriendRequestEntity, ChannelEntity, ChannelInviteEntity
    ]),
],
  controllers: [GameController],
  providers: [GameService, GameGateway, UsersService, ChannelsService]
})
export class GameModule {}
