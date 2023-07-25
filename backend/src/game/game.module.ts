import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { TypeOrmModule } from "@nestjs/typeorm";
import { gameHistoryEntity } from './entities/gameHistory.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { FriendRequestEntity } from 'src/users/entities/friend_request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature ([
      gameHistoryEntity, UserEntity, FriendRequestEntity
    ]),
],
  controllers: [GameController],
  providers: [GameService, GameGateway, UsersService]
})
export class GameModule {}
