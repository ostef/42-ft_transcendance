export class CreateChannelDto
{
	ownerId: number;
	name: string;
	description: string;
}

export class InviteUserDto
{
	fromId: number;
	toId: number;
	channelId: number;
	message: string;
}

export class MessageDto
{
	fromId: number;
	toChannelId: number;
	toUserId: number;
	content: string;
}
