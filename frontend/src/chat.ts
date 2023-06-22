import { Socket, io } from "socket.io-client";
import axios from "axios";
import { useChatStore } from "@/stores/chat";
import { useUserStore, type User } from "@/stores/user";
import { storeToRefs } from "pinia";

export let chatSocket: Socket;

export function connectChatSocket ()
{
    const store = useChatStore ();

    if (chatSocket && chatSocket.connected)
        return;

    chatSocket = io (
        "http://localhost:3000/chat",
        {
            auth: { token: localStorage.getItem ("token") },
        }
    );

    chatSocket.on ("connect_error", (err) => { console.error (err); });
    chatSocket.on ("connection_error", (err) => { console.error (err); });
    chatSocket.on ("exception", (err) => { console.error (err); });
    chatSocket.on ("error", (err) => { console.error (err); });

    chatSocket.on ("newMessage", (msg) => {

        let user = store.users.find ((val) => val.id == msg.sender);

        if (user)
            store.messages.push ({sender: user, content: msg.content, date: new Date (msg.date)});
        else
            console.error ("Received new message but sender wasn't found:", msg);
    });

    chatSocket.on ("onlineUsers", (onlineUsers) => {
        store.onlineUsers = onlineUsers
    });

    chatSocket.on ("channelInfo", (channel) => {
        const indexInStore = store.channels.findIndex ((val) => val.id == channel.id);
        if (indexInStore != -1)
            store.channels[indexInStore] = channel;
    });
}

export function disconnectChatSocket ()
{
    if (chatSocket && chatSocket.connected)
        chatSocket.disconnect ();
}

export async function fetchChannels ()
{
    const store = useChatStore ();

    const result = await axios.get ("channels/joined");

    store.channels = result.data;
}

export async function fetchPrivateConversations ()
{
    const store = useChatStore ();

    const result = await axios.get ("channels/discussions");

    store.privateConvs = result.data;
}

export function notifyChannelChange (channelId: string)
{
    chatSocket.emit ("channelUpdated", channelId);
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

export async function fetchPrivateMessages (otherId: string)
{
    const store = useChatStore ();

    const result = await axios.get ("channels/discussions/" + otherId);

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

export async function selectChannel (channelId: string)
{
    const store = useChatStore ();

    await fetchUsers (channelId);
    await fetchMessages (channelId);

    if (store.selectedChannel)
        unwatchChannel (store.selectedChannel.id);

    if (store.selectedUser)
        unwatchPrivConv (store.selectedUser.id);

    watchChannel (channelId);
    store.selectedChannelIndex = store.channels.findIndex ((val) => val.id == channelId);
    store.selectedUserIndex = -1;
}

export function watchPrivConv (userId: string)
{
    chatSocket.emit ("watchPrivConv", userId);
}

export function unwatchPrivConv (userId: string)
{
    chatSocket.emit ("unwatchPrivConv", userId);
}

export async function selectPrivConv (userId: string)
{
    const chat = useChatStore ();
    const {user: me} = storeToRefs (useUserStore ());

    await fetchPrivateMessages (userId);

    if (chat.selectedChannel)
        unwatchChannel (chat.selectedChannel.id);

    if (chat.selectedUser)
        unwatchPrivConv (chat.selectedUser.id);

    watchPrivConv (userId);
    chat.selectedUserIndex = chat.privateConvs.findIndex ((val) => val.id == userId);
    chat.selectedChannelIndex = -1;

    chat.users.length = 0;

    if (me.value)
        chat.users.push (me.value);
    if (chat.selectedUser)
        chat.users.push (chat.selectedUser);

    chat.users.sort ((a, b) => a.nickname.localeCompare (b.nickname));
}
