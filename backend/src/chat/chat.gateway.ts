import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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
	onNewMessage (@MessageBody() body: any)
	{
		console.log ("newMessage: " + body);

		// Send the message to all other clients
		this.server.emit ("onMessage", {
			msg: "New Message",
			content: body,
		});
	}
}
