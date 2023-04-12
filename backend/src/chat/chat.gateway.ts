import { OnModuleInit, UseGuards, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { InviteService } from './invite.service';
import { MessageService } from './message.service';

import { JwtService } from '@nestjs/jwt';

import * as cookie from 'cookie';

type ChannelParams = {
  id: number;
  name: string;
  isPrivate: boolean;
  password: string;
};

type MessageParams = {
  toUserId: number;
  toChannelId: number;
  content: string;
};

type InviteParams = {
  senderId: number;
  receiverId: number;
  channelId: number;
  message: string;
  accept: boolean;
};

@UseGuards(JwtAuthGuard)
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling'],
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private channelService: ChannelService,
    private messageService: MessageService,
    private inviteService: InviteService,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.server.use((socket, next) => {
      const token = cookie.parse(socket.handshake.headers.cookie)[
        'access_token'
      ];
      if (!token) {
        return next(new WsException('No token'));
      }
      try {
        const payload = this.jwtService.verify(token);
        next();
      } catch (e) {
        return next(new WsException('Invalid token'));
      }
    });
    this.server.on('connection', (socket) => {
      console.log('New connection (' + socket.id + ')');
      this.server.emit('onConnection', {
        id: socket.id,
      });
    });
  }

  afterInit(server: Server) {
    this.logger.log('Socket server initialized');
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('createChannel')
  onCreateChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: ChannelParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('updateChannel')
  onUpdateChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: ChannelParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('deleteChannel')
  onDeleteChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: ChannelParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinChannel')
  onJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: ChannelParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leaveChannel')
  onLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: ChannelParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('sendMessage')
  onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: MessageParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('inviteUser')
  onInviteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: InviteParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('handleInvite')
  onHandleInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() params: InviteParams,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('getPublicChannels')
  onGetPublicChannels(@ConnectedSocket() client: Socket) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('getJoinedChannels')
  onGetJoinedChannels(@ConnectedSocket() client: Socket) {}
}

/*
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
*/
