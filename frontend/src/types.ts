export interface IMessage
{
	senderId: number;
	date: Date;
	content: string;
}

export interface IChannel
{
	id: number;
	name: string;
	description: string;
	ownerId: number;
}

export interface IUser
{
	id: number;
	username: string;
	profilePictureURL: string;
	isModerator: boolean;
}
