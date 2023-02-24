import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Conversation
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(() => User, (u) => u.conversations)
	users: User[];

	@Column()
	dateCreated: Date;

	@OneToMany(() => Message, (msg) => msg.conversation)
	messages: Message[];
}

@Entity()
export class Message
{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Conversation, (conv) => conv.messages)
	conversation: Conversation;

	@OneToOne(() => User)
	@JoinColumn()
	fromUser: User;

	@Column()
	dateSent: Date;

	@Column()
	content: string;
}
