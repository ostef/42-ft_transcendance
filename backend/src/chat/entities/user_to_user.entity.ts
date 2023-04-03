import {
	Entity,
	PrimaryColumn, Column, CreateDateColumn, JoinColumn, JoinTable,
	OneToOne, OneToMany, ManyToOne, ManyToMany
} from 'typeorm';

import { User } from '../../users/user.entity';
import { ChannelInvite } from "./invite.entity";
import { Message } from "./message.entity";

@Entity()
export class UserToUser
{
	@PrimaryColumn ()
	@ManyToMany (() => User, (u) => u.conversations)
	users: User[];

	@OneToMany (() => Message, (msg) => msg.toUser)
	messages: Message[];
}
