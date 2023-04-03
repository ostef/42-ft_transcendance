import {
	Entity,
	PrimaryColumn, Column, CreateDateColumn, JoinColumn, JoinTable,
	OneToOne, OneToMany, ManyToOne, ManyToMany,
} from 'typeorm';

import { User } from '../../users/user.entity';
import { Channel } from "./channel.entity";

@Entity()
export class ChannelInvite
{
	@ManyToOne (() => User)
	fromUser: User;

	@ManyToOne (() => User, (u) => u.receivedInvites)
	toUser: User;

	@ManyToOne (() => Channel, (c) => c.pendingInvites)
	channel: Channel;

	@CreateDateColumn ()
	date: Date;

	@Column ("text")
	message: string;
}
