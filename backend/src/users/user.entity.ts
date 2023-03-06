import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Channel } from '../chat/entities';

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

  @ManyToMany(() => User, (u) => u.blockedUsers)
  blockedUsers : User[];

  @ManyToMany(() => Channel, (conv) => conv.users)
  @JoinTable()
  joinedChannels: Channel[];

  @OneToMany(() => Channel, (conv) => conv.owner)
  @JoinTable()
  ownedChannels: Channel[];
}
