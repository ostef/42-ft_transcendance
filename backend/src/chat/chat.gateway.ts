import { ArgumentsHost, Catch, HttpException, Logger, OnModuleInit, UseFilters } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { AuthService } from "src/auth/auth.service";
import { ChannelsService } from "./channels.service";
import { UsersService } from "src/users/users.service";
import { MessageService } from "./message.service";

@Catch (WsException, HttpException)
export class SocketsExceptionFilter extends BaseWsExceptionFilter
{
    private logger: Logger = new Logger ("SocketsExceptionFilter");

    catch (exception: WsException | HttpException, host: ArgumentsHost)
    {
        this.logger.error (exception.stack);

        const client = host.switchToWs ().getClient () as WebSocket;
        const data = host.switchToWs ().getData ();
        const error = exception instanceof WsException ? exception.getError () : exception.getResponse ();
        const details = error instanceof Object ? { ...error } : { message : error };

        client.send (JSON.stringify ({
            event: "error",
            data: {
                id: (client as any).id,
                rid: data.rid,
                ...details
            }
        }));
    }
}

class JoinChannelParams
{
    channelId: string;
    password?: string;
}

class MessageParams
{
    channelId?: string;
    userId?: string;
    content: string;
}

@WebSocketGateway ({
    namespace: "chat",
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET","POST"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
})
export class ChatGateway
    implements OnModuleInit
{
    private logger: Logger = new Logger ("ChatGateway");

    @WebSocketServer ()
    server: Server;

    constructor (
        private channelsService: ChannelsService,
        private usersService: UsersService,
        private messageService: MessageService,
        private authService: AuthService,
    ) {}

    onModuleInit ()
    {
        this.server.use ((socket, next) => {
            const payload = this.authService.getPayloadFromToken (socket.handshake.auth.token);

            if (!payload || !this.authService.validateUser (payload.userId))
            {
                next (new WsException ("Unauthorized"));
            }
            else
            {
               socket.data.userId = payload.userId;
               next ();
            }
        });

        this.server.on ("connection", async (socket) => {
            const user = await this.usersService.findUserEntity ({id: socket.data.userId});
            this.logger.log ("New connection (" + socket.id + "), user " + user.username);

            socket.on ("disconnect", async () =>
            {
                const user = await this.usersService.findUserEntity ({id: socket.data.userId});
                this.logger.log ("User " + user.username + " has disconnected");

                const rooms = Array.from (socket.rooms.keys ());
                socket.to (rooms).emit ("userOffline", socket.data.userId);
            });
        });
    }

    @SubscribeMessage ("newMessage")
    async handleMessage (client: Socket, msg: MessageParams)
    {
        if (msg.channelId != undefined)
        {
            const sent = await this.messageService.sendMessageToChannel (client.data.userId, msg.channelId, msg.content);

            this.server.to ("Channel#" + msg.channelId).emit ("newMessage", {
                sender: client.data.userId,
                content: msg.content,
                date: sent.timestamp
            });
        }
    }

    @SubscribeMessage ("watchChannel")
    watchChannel (client: Socket, channelId: string)
    {
        client.join ("Channel#" + channelId);
    }

    @SubscribeMessage ("unwatchChannel")
    unwatchChannel (client: Socket, channelId: string)
    {
        client.leave ("Channel#" + channelId);
    }
}
