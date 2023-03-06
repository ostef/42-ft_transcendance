import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Conversation } from '../chat/chat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  nickname: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: true,
  })
  has2FA: boolean;

  @ManyToMany(() => Conversation, (conv) => conv.users)
  @JoinTable()
  conversations: Conversation[];

  // friends
  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];
}
