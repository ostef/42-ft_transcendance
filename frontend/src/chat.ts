import { Socket, io } from "socket.io-client";
import { useChatStore } from "@/stores/chat";
import { type User } from "@/stores/user";

export let chatSocket: Socket;

export function connectChatSocket ()
{
    chatSocket = io (
        "http://localhost:3000/chat",
        {
            auth: { token: localStorage.getItem ("token") },
        }
    );

    chatSocket.on ("connect_error", (err) => { console.log (err); });
    chatSocket.on ("connection_error", (err) => { console.log (err); });
    chatSocket.on ("exception", (err) => { console.log (err); });
    chatSocket.on ("updateUserList", (users: any[]) =>
    {
        const chatStore = useChatStore ();

        chatStore.users = users;
    });
}

export function disconnectChatSocket ()
{
    chatSocket.disconnect ();
}
