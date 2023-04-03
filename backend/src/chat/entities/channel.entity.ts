import {
	Entity,
	PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, JoinTable,
	OneToOne, OneToMany, ManyToOne, ManyToMany
} from 'typeorm';

import { User } from '../../users/user.entity';
import { ChannelInvite } from "./invite.entity";
import { Message } from "./message.entity";

@Entity()
export class Channel
{
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn ()
	dateCreated: Date;

	@Column({nullable: true})
	name: string;

	@Column()
	isPrivate: boolean;

	@Column({nullable: true})
	password: string;

	@OneToMany (() => ChannelInvite, (invite) => invite.channel)
	@JoinColumn ()
	pendingInvites: ChannelInvite[];

	@ManyToOne(() => User, {nullable: true})
	@JoinColumn ()
	owner: User;

	@ManyToMany(() => User, (u) => u.joinedChannels)
	@JoinTable ()
	users: User[];

	@ManyToMany (() => User)
	@JoinTable ()
	moderatorUsers: User[];

	@ManyToMany (() => User)
	@JoinTable ()
	bannedUsers: User[];

	@OneToMany(() => Message, (msg) => msg.toChannel)
	messages: Message[];
}
