import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Channel
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	isPrivate: boolean;

	@Column()
	password: string;

	@ManyToOne(() => User, (u) => u.ownedChannels)
	owner: User;

	@ManyToMany(() => User, (u) => u.joinedChannels)
	users: User[];

	@Column()
	dateCreated: Date;

	@OneToMany(() => Message, (msg) => msg.channel)
	messages: Message[];
}

@Entity()
export class Message
{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Channel, (conv) => conv.messages)
	channel: Channel;

	@OneToOne(() => User)
	@JoinColumn()
	fromUser: User;

	@Column()
	dateSent: Date;

	@Column()
	content: string;
}
