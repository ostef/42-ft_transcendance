import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

class Message
{
	from: string;
	date: Date;
	content: string;
};

@WebSocketGateway({
	namespace: "/chat",
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})
export class ChatGateway implements OnModuleInit
{
	@WebSocketServer ()
	server: Server;

	messages: Message[] = [];

	onModuleInit ()
	{
		this.server.on ("connection", (socket) => {
			console.log ("New connection (" + socket.id + ")");

			this.server.emit ("onConnection", {
				id: socket.id,
			});
		});
	}

	@SubscribeMessage ("newMessage")
	onNewMessage (@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		console.log ("newMessage: ", data);

		this.messages.push ({ from: client.id, date: data.date, content: data.content });
		// Send the message to all other clients
		this.server.emit ("onMessage", { from: client.id, date: data.date, content: data.content });
	}

	@SubscribeMessage ("getMessageHistory")
	onGetMessageHistory (@ConnectedSocket() client: Socket, @MessageBody() lastMessage: Message)
	{
		console.log ("getMessageHistory: ", lastMessage);
		console.log ("History: ", this.messages);

		let history : Message[] = [];

		let index = this.messages.length;
		if (lastMessage != null)
			index = this.messages.findIndex ((val: Message) =>
				val.from == lastMessage.from
				&& val.date == lastMessage.date
				&& val.content == lastMessage.content);

		if (index == -1)
		{
			console.log ("Message ", lastMessage, " does not exist in the history");
			return;
		}

		const MAX_MESSAGES = 10;
		let start_index = index - MAX_MESSAGES;
		if (start_index < 0)
			start_index = 0;

		for (let i = start_index; i < index; i++)
		{
			history.push (this.messages.at (i));
		}

		console.log ("Emitting message history: ", history);
		client.emit ("messageHistory", history);
	}
}
