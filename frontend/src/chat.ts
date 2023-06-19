import { Socket, io } from "socket.io-client";
import axios from "axios";
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

    chatSocket.on ("newMessage", (msg) => {
        const user = store.users.find ((val) => val.id == msg.sender);

        if (user != undefined)
            store.messages.push ({sender: user, content: msg.content, date: new Date (msg.date)});
    });
}

export function disconnectChatSocket ()
{
    chatSocket.disconnect ();
}

export async function fetchChannels ()
{
    const store = useChatStore ();

    const result = await axios.get ("channels/joined");

    store.channels = result.data;
}

export async function fetchChannelInfo (channelId: string)
{
    const store = useChatStore ();

    const index = store.channels.findIndex ((val) => val.id == channelId);

    if (index != -1)
    {
        const result = await axios.get ("channels/" + channelId);

        store.channels[index] = result.data;
    }
}

export async function fetchUsers (channelId: string)
{
    const store = useChatStore ();

    const result = await axios.get ("channels/" + channelId + "/users");

    store.users = result.data;
}

export async function fetchMessages (channelId: string)
{
    const store = useChatStore ();

    const result = await axios.get ("channels/" + channelId + "/messages");

    store.messages = result.data;
}

export function watchChannel (channelId: string)
{
    chatSocket.emit ("watchChannel", channelId);
}

export function unwatchChannel (channelId: string)
{
    chatSocket.emit ("unwatchChannel", channelId);
}
