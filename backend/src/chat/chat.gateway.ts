import { ArgumentsHost, Catch, HttpException, Logger, OnModuleInit, UseFilters } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { RemoteSocket, Server, Socket } from "socket.io";

import { AuthService } from "src/auth/auth.service";
import { ChannelsService } from "./channels.service";
import { UsersService } from "src/users/users.service";
import { MessageService } from "./message.service";

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

class UserKickedOrBanned
{
    channelId: string;
    userId: string;
    message: string;
    kicked: boolean;
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

            const onlineUsers = await this.getOnlineUsers ();
            this.server.emit ("onlineUsers", onlineUsers);

            socket.on ("disconnect", async () =>
            {
                const user = await this.usersService.findUserEntity ({id: socket.data.userId});
                this.logger.log ("User " + user.username + " has disconnected");

                const onlineUsers = await this.getOnlineUsers ();
                socket.broadcast.emit ("onlineUsers", onlineUsers);
            });
        });
    }

    async getOnlineUsers (): Promise<string[]>
    {
        const socks = await this.server.fetchSockets ();
        const result = [] as string[];

        for (const client of socks)
            result.push (client.data.userId);

        return result;
    }

    @SubscribeMessage ("newMessage")
    async handleMessage (client: Socket, msg: MessageParams)
    {
        try
        {
            if (msg.channelId != undefined)
            {
                const sent = await this.messageService.sendMessageToChannel (client.data.userId, msg.channelId, msg.content);

                this.server.to ("Channel#" + msg.channelId).emit ("newMessage", {
                    sender: client.data.userId,
                    toChannel: msg.channelId,
                    content: msg.content,
                    date: sent.timestamp
                });
            }

            if (msg.userId != undefined)
            {
                const sent = await this.messageService.sendMessageToUser (client.data.userId, msg.userId, msg.content);

                const firstKey = client.data.userId.localeCompare (msg.userId) < 0 ? client.data.userId : msg.userId;
                const secondKey = client.data.userId.localeCompare (msg.userId) < 0 ? msg.userId : client.data.userId;

                this.server.to ("PrivConv#" + firstKey + "&" + secondKey).emit ("newMessage", {
                    sender: client.data.userId,
                    toUser: msg.userId,
                    content: msg.content,
                    date: sent.timestamp
                });
            }
        }
        catch (err)
        {
            this.logger.error (err.stack);
            client.emit ("error", err.message);
        }
    }

    @SubscribeMessage ("channelUpdated")
    notifyChannelChange (client: Socket, channelId: string)
    {
        // We don't send the channel info, just the id of the channel, because
        // we don't want to select to who we need to send this message.
        this.server.emit ("channelUpdated", channelId);
    }

    @SubscribeMessage ("userKickedOrBanned")
    async notifyChannelUserChange (client: Socket, params: UserKickedOrBanned)
    {
        const socks = await this.server.fetchSockets ();

        for (const client of socks)
        {
            if (client.data.userId == params.userId)
            {
                client.emit ("kickedOrBanned", params);

                return;
            }
        }
   }

    @SubscribeMessage ("getChannelInfo")
    async sendChannelInfo (client: Socket, channelId: string)
    {
        const info = await this.channelsService.getChannelInfo (client.data.userId, channelId);

        client.emit ("channelInfo", info);
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

    @SubscribeMessage ("watchPrivConv")
    watchPrivConv (client: Socket, userId: string)
    {
        const firstKey = client.data.userId.localeCompare (userId) < 0 ? client.data.userId : userId;
        const secondKey = client.data.userId.localeCompare (userId) < 0 ? userId : client.data.userId;

        client.join ("PrivConv#" + firstKey + "&" + secondKey);
    }

    @SubscribeMessage ("unwatchPrivconv")
    unwatchPrivConv (client: Socket, userId: string)
    {

        const firstKey = client.data.userId.localeCompare (userId) < 0 ? client.data.userId : userId;
        const secondKey = client.data.userId.localeCompare (userId) < 0 ? userId : client.data.userId;

        client.leave ("PrivConv#" + firstKey + "&" + secondKey);
    }
}
