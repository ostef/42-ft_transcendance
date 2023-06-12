import { Socket, io } from "socket.io-client";
import { useChatStore } from "@/stores/chat";
import { type User } from "@/stores/user";

export let chatSocket: Socket;

export function connectChatSocket ()
{
    const store = useChatStore ();

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
    chatSocket.on ("newMessage", (msg) => {
        const user = store.users.find ((val) => val.id == msg.sender);
        console.log (user);

        if (user != undefined)
            store.messages.push ({sender: user, content: msg.content, date: new Date (msg.date)});
    });
}

export function disconnectChatSocket ()
{
    chatSocket.disconnect ();
}
