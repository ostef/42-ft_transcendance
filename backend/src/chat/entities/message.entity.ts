import {
	Entity,
	PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, JoinTable,
	OneToOne, OneToMany, ManyToOne, ManyToMany
} from 'typeorm';

import { User } from '../../users/user.entity';
import { Channel } from "./channel.entity";
import { UserToUser } from './user_to_user.entity';

@Entity ()
export class Message
{
	@PrimaryGeneratedColumn ()
	id: number;

	@CreateDateColumn ()
	dateSent: Date;

	@OneToOne (() => User)
	@JoinColumn ()
	fromUser: User;

	@ManyToOne (() => UserToUser, (utu) => utu.messages, {nullable: true})
	@JoinColumn ()
	toUser: UserToUser;	// If direct message, can be null

	@ManyToOne (() => Channel, (chan) => chan.messages, {nullable: true})
	toChannel: Channel;	// If sent to a channel, can be null

	@Column ("text")
	content: string;
}
