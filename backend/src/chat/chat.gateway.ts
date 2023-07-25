import { ArgumentsHost, Catch, HttpException, Logger, OnModuleInit, UseFilters } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { RemoteSocket, Server, Socket } from "socket.io";

import { AuthService } from "src/auth/auth.service";
import { ChannelsService } from "./channels.service";
import { UsersService } from "src/users/users.service";
import { MessageService } from "./message.service";
import { ChannelInviteDto } from "./types";

// @Todo: notify connected users when a nickname has changed
// @Todo: notify connected users when an avatarFile has changed

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

class ChannelInviteParams
{
    userId: string;
    channelId: string;
    message: string;
}

class GameInviteParams
{
    userId: string;
    gameId: string;
    message: string;
}

class UserKickedOrBanned
{
    channelId: string;
    userId: string;
    message: string;
    kicked: boolean;
}

class UserFriendshipChanged
{
    userId: string;
    event: "blocked" | "unblocked" | "friend-removed" | "friend-accepted" | "friend-request" | "friend-declined";
}

@WebSocketGateway ({
    namespace: "chat",
    cors: {
        origin: "http://localhost:8080",
    },
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

    async addUsersToPrivConvRoom (firstUser: string, secondUser: string)
    {
        const socks = await this.server.fetchSockets ();
        for (const sock of socks)
        {
            if (sock.data.userId == firstUser || sock.data.userId == secondUser)
                sock.join ("PrivConv#" + firstUser + "&" + secondUser);
        }
    }

    @SubscribeMessage ("newMessage")
    async handleMessage (client: Socket, msg: MessageParams)
    {
        try
        {
            let sent = null;
            let room = "";

            if (msg.channelId != undefined)
            {
                sent = await this.messageService.sendMessageToChannel (client.data.userId, msg.channelId, msg.content);
                room = "Channel#" + msg.channelId;
            }

            if (msg.userId != undefined)
            {
                const {msg: newMsg, newConv} = await this.messageService.sendMessageToUser (client.data.userId, msg.userId, msg.content);
                sent = newMsg;

                const firstKey = client.data.userId.localeCompare (msg.userId) < 0 ? client.data.userId : msg.userId;
                const secondKey = client.data.userId.localeCompare (msg.userId) < 0 ? msg.userId : client.data.userId;

                room = "PrivConv#" + firstKey + "&" + secondKey;

                if (newConv)
                {
                    await this.addUsersToPrivConvRoom (firstKey, secondKey);
                }
            }

            if (sent)
            {
                this.server.to (room).emit ("newMessage", {
                    sender: client.data.userId,
                    content: msg.content,
                    date: sent.timestamp,
                    toChannel: msg.channelId,
                    toUser: msg.userId,
                });
            }
        }
        catch (err)
        {
            this.logger.error (err.stack);
            client.emit ("error", err.message);
        }
    }

    @SubscribeMessage ("channelInvite")
    async handleChannelInvite (client: Socket, params: ChannelInviteParams)
    {
        try
        {
            const invite = await this.channelsService.inviteToChannel (client.data.userId, params.userId, params.channelId);
            const {msg, newConv} = await this.messageService.sendMessageToUser (client.data.userId, params.userId, params.message, invite);

            const firstKey = client.data.userId.localeCompare (params.userId) < 0 ? client.data.userId : params.userId;
            const secondKey = client.data.userId.localeCompare (params.userId) < 0 ? params.userId : client.data.userId;

            if (newConv)
            {
                await this.addUsersToPrivConvRoom (firstKey, secondKey);
            }

            this.server.to ("PrivConv#" + firstKey + "&" + secondKey).emit ("newMessage", {
                sender: client.data.userId,
                content: params.message,
                date: msg.timestamp,
                toUser: params.userId,
                channelInvite: ChannelInviteDto.fromChannelInviteEntity (invite)
            });
        }
        catch (err)
        {
            this.logger.error (err.stack);
            client.emit ("error", err.message);
        }
    }

    @SubscribeMessage ("gameInvite")
    async handleGameInvite (client: Socket, params: GameInviteParams)
    {
        try
        {
            const {msg, newConv} = await this.messageService.sendMessageToUser (client.data.userId, params.userId, params.message, null, params.gameId);

            const firstKey = client.data.userId.localeCompare (params.userId) < 0 ? client.data.userId : params.userId;
            const secondKey = client.data.userId.localeCompare (params.userId) < 0 ? params.userId : client.data.userId;

            if (newConv)
            {
                await this.addUsersToPrivConvRoom (firstKey, secondKey);
            }

            this.server.to ("PrivConv#" + firstKey + "&" + secondKey).emit ("newMessage", {
                sender: client.data.userId,
                content: params.message,
                date: msg.timestamp,
                toUser: params.userId,
                gameId: params.gameId
            });
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

    @SubscribeMessage ("channelDeleted")
    async notifyChannelDeleted (client: Socket, channelId: string)
    {
        this.server.emit ("channelDeleted", channelId);
    }

    @SubscribeMessage ("userKickedOrBanned")
    async notifyChannelUserChange (client: Socket, params: UserKickedOrBanned)
    {
        const socks = await this.server.fetchSockets ();

        for (const client of socks)
        {
            if (client.data.userId == params.userId)
                client.emit ("kickedOrBanned", params);
        }
   }

    @SubscribeMessage ("userFriendshipChanged")
    async notifyUserFriendshipChange (client: Socket, params: UserFriendshipChanged)
    {
        const sockets = await this.server.fetchSockets ();

        for (const other of sockets)
        {
            if (other.data.userId == params.userId)
                other.emit ("friendshipChanged", {userId: client.data.userId, event: params.event});
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

    @SubscribeMessage ("unwatchAllChannels")
    unwatchAllChannels (client: Socket)
    {
        for (const room of client.rooms)
        {
            if (room.startsWith ("Channel#"))
                client.leave (room);
        }
    }

    @SubscribeMessage ("watchPrivConv")
    watchPrivConv (client: Socket, userId: string)
    {
        const firstKey = client.data.userId.localeCompare (userId) < 0 ? client.data.userId : userId;
        const secondKey = client.data.userId.localeCompare (userId) < 0 ? userId : client.data.userId;

        client.join ("PrivConv#" + firstKey + "&" + secondKey);
    }

    @SubscribeMessage ("unwatchPrivConv")
    unwatchPrivConv (client: Socket, userId: string)
    {

        const firstKey = client.data.userId.localeCompare (userId) < 0 ? client.data.userId : userId;
        const secondKey = client.data.userId.localeCompare (userId) < 0 ? userId : client.data.userId;

        client.leave ("PrivConv#" + firstKey + "&" + secondKey);
    }

    @SubscribeMessage ("unwatchAllConvs")
    unwatchAllConvs (client: Socket)
    {
        for (const room of client.rooms)
        {
            if (room.startsWith ("PrivConv#"))
                client.leave (room);
        }
    }
}
