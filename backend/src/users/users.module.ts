import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Friendship } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
