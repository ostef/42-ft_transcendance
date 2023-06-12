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
            this.sendUserList ();

            socket.on ("disconnect", async () =>
            {
                const user = await this.usersService.findUserEntity ({id: socket.data.userId});
                this.logger.log ("User " + user.username + " has disconnected");
                this.sendUserList ();
            });
        });
    }

    @SubscribeMessage ("getUserList")
    async sendUserList (client: Socket | null = null)
    {
        const userList = [];
        const socks = await this.server.fetchSockets ();
        for (const sock of socks)
        {
            const user = await this.usersService.findUserEntity ({id: sock.data.userId});
            if (!user)
                continue;

            userList.push ({
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatarFile: user.avatarFile,
            });
        }

        // Sort user list by nickname
        userList.sort ((a, b) => a.nickname.localeCompare (b.nickname));

        if (client)
            client.emit ("updateUserList", userList);
        else
            this.server.emit ("updateUserList", userList);
    }

    /*
    @SubscribeMessage ("getClientInfo")
    async sendClientUserInfo (client: Socket)
    {
        const user = await this.usersService.findUserEntity ({id: client.data.userId}, {
            joinedChannels: {
                owner: true,
                users: true,
                administrators: true,
                mutedUsers: true
            },
            privateConversations: true, blockedUsers: true, friends: true
        });

        if (!user)
        {
            client.disconnect (true);
            throw new WsException ("User does not exist");
        }

        const {password, ...result} = user;
        result.joinedChannels.forEach ((val) => delete val.password);

        client.emit ("updateClientInfo", result);
    }

    @SubscribeMessage ("getUserInfo")
    async sendUserInfo (client: Socket, userId: string)
    {
        const user = await this.usersService.findUserEntity ({id: userId});
        if (!user)
            throw new WsException ("User does not exist");

        let result: any;
        result.id = user.id;
        result.username = user.username;
        result.nickname = user.nickname;
        result.avatarFile = user.avatarFile;

        client.emit ("updateUserInfo", result);
    }

    @SubscribeMessage ("getChannelInfo")
    async sendChannelInfo (client: Socket, channelId: string)
    {
        const channel = await this.channelsService.findChannelEntity ({id: channelId});
        if (!channel)
            throw new WsException ("Channel does not exist");

        client.emit ("updateChannelInfo");
    }

    @SubscribeMessage ("getChannelMessages")
    async sendChannelMessages (client: Socket, channelId: string)
    {
        const channel = await this.channelsService.findChannelEntity (
            {id: channelId},
            {messages: {fromUser: true}}
        );
        if (!channel)
            throw new WsException ("Channel does not exist");

        const result = [];
        for (const msg of channel.messages)
        {
            result.push ({
                fromUserId: msg.fromUser.id,
                toChannelId: channelId,
                content: msg.content
            });
        }

        client.emit ("updateMessages", result);
    }

    @SubscribeMessage ("getConversationMessages")
    async sendPrivateConversationMessages (client: Socket, otherId: string)
    {
        const firstUser = await this.usersService.findUserEntity ({id: client.data.userId});
        if (!firstUser)
            throw new WsException ("User does not exist");

        const secondUser = await this.usersService.findUserEntity ({id: otherId});
        if (!secondUser)
            throw new WsException ("User does not exist");

        const conv = await this.messageService.findOrCreatePrivConversation (
            firstUser, secondUser,
            {
                messages: {fromUser: true, toPrivateConversation: true}
            }
        );

        const result = [];
        for (const msg of conv.messages)
        {
            result.push ({
                fromUserId: msg.fromUser.id,
                toUserId: msg.fromUser.id == conv.firstUser.id ? conv.secondUser.id : conv.firstUser.id,
                content: msg.content
            });
        }

        client.emit ("updateMessages", result);
    }

    @SubscribeMessage ("getPublicChannels")
    async sendAllPublicChannels (client: Socket)
    {
        const channels = await this.channelsService.findMultipleChannels ({isPrivate: false});

        const result = [];
        for (const chan of channels)
        {
            result.push ({
                id: chan.id,
                name: chan.name,
                description: chan.description,
                isPasswordProtected: chan.password != null,
                isPrivate: false
            });
        }

        client.emit ("updatePublicChannels", result);
    }

    @SubscribeMessage ("joinChannel")
    async handleJoinChannel (client: Socket, params: JoinChannelParams)
    {
        await this.channelsService.joinChannel (params.channelId, client.data.userId, params.password);
        client.emit ("newUser", {userId: client.data.userId, channelId: params.channelId});
    }

    @SubscribeMessage ("sendMessage")
    async receiveMessage (client: Socket, params: MessageParams)
    {
        this.logger.log ("New message: ", params);
        try
        {
            if (params.channelId != undefined)
            {
                if (params.userId != undefined)
                    throw new WsException ("Invalid parameters");

                await this.messageService.sendMessageToChannel (client.data.userId, params.channelId, params.content);

                this.server.emit ("newMessage", {
                    fromUserId: client.data.userId,
                    toChannelId: params.channelId,
                    content: params.content
                });
            }
            else if (params.userId != undefined)
            {
                await this.messageService.sendMessageToUser (client.data.userId, params.userId, params.content);

                this.server.emit ("newMessage", {
                    fromUserId: client.data.userId,
                    toUserId: params.userId,
                    content: params.content
                },
                to: params.userId);
            }
            else
            {
                throw new WsException ("Invalid parameters");
            }
        }
        catch (err)
        {
            throw new WsException (err);
        }
    }
    */
}
