import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { Conversation } from '../chat/chat.entity';

@Entity()
export class User {
  //TODO: change this to uuid
  @PrimaryGeneratedColumn({ type: 'int' })
  id?: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nickname: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: true,
  })
  has2FA: boolean;

  @Column({ type: 'bytea', nullable: true })
  avatar: any;

  @ManyToMany(() => Conversation, (conv) => conv.users)
  @JoinTable()
  conversations: Conversation[];
}

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', length: 255, unique: false })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: false })
  friendname: string;

  // //link friend with cascade
  // @OneToOne(() => User, (user) => user.id, { cascade: true })
  // friend: User;

  // @Column({ type: 'varchar', length: 255, unique: false })
  // friendname: string;
}
