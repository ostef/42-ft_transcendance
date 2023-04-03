import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';

import { Channel } from "../chat/entities/channel.entity";
import { UserToUser } from "../chat/entities/user_to_user.entity";
import { ChannelInvite } from "../chat/entities/invite.entity";

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
