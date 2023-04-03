import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';

import { Channel } from "../chat/entities/channel.entity";
import { UserToUser } from "../chat/entities/user_to_user.entity";
import { ChannelInvite } from "../chat/entities/invite.entity";

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
  @JoinTable()
  blockedUsers : User[];

  @OneToMany(() => ChannelInvite, (invite) => invite.toUser)
  receivedInvites: ChannelInvite[];

  @ManyToMany(() => Channel, (chan) => chan.users)
  joinedChannels: Channel[];

  @ManyToMany (() => UserToUser, (utu) => utu.users)
  conversations: UserToUser[];
}
