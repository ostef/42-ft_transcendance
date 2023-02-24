import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Conversation } from '../chat/chat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  nickname: string;

  @Column()
  password: string;

  @Column()
  has2FA: boolean;

  @ManyToMany(() => Conversation, (conv) => conv.users)
  @JoinTable()
  conversations: Conversation[];
}
