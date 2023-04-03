import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  JoinTable,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/user.entity';
import { ChannelInvite } from './invite.entity';
import { Message } from './message.entity';

@Entity()
export class UserToUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (u) => u.conversations)
  users: User[];

  @OneToMany(() => Message, (msg) => msg.toUser)
  messages: Message[];
}
