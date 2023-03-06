import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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
	onNewMessage (@ConnectedSocket() client: Socket, @MessageBody() data: string)
	{
		console.log ("newMessage: " + data);

		// Send the message to all other clients
		this.server.emit ("onMessage", { from: client.id, content: data });
	}
}
