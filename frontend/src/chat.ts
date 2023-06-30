import { Socket, io } from "socket.io-client";
import axios from "axios";
import { useChatStore } from "@/stores/chat";
import { useUserStore, type User } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchUserInfo } from "./authentication";

export let chatSocket: Socket;

export function connectChatSocket ()
{
    const store = useChatStore ();
    const { user: me } = useUserStore ();

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

    chatSocket.on ("newMessage", async (msg) => {
        if (msg.toUser && !store.hasPrivConv (msg.sender) && !store.hasPrivConv (msg.toUser))
        {
            await fetchPrivateConversations ();
            clearDiscussions ();
        }

        // We received a message in a discussion that is not visible on the screen, ignore
        if (!store.selectedChannel && !store.selectedUser)
            return;

        if (msg.toUser)
        {
            if (msg.toUser !== store.selectedUser?.id && msg.sender !== store.selectedUser?.id)
                return;
        }
        else if (msg.toChannel)
        {
            if (msg.toChannel !== store.selectedChannel?.id)
                return;
        }

        const user = store.users.find ((val) => val.id == msg.sender);

        if (user)
            store.messages.push ({sender: user, content: msg.content, date: new Date (msg.date), channelInvite: msg.channelInvite});
        else
            console.error ("Received new message but sender wasn't found:", msg);
    });

    chatSocket.on ("onlineUsers", (onlineUsers) => {
        store.onlineUsers = onlineUsers
    });

    chatSocket.on ("channelUpdated", async (channelId) => {
        await fetchChannelInfo (channelId);

        if (channelId == store.selectedChannel?.id)
        {
            await fetchUsers (channelId);
        }
    });

    chatSocket.on ("channelDeleted", async (channelId: string) => {
        const channelIndex = store.channels.findIndex ((val) => val.id == channelId);
        if (channelIndex == -1)
            return;

        store.channels.splice (channelIndex, 1);

        if (channelIndex == store.selectedChannelIndex)
        {
            store.selectedChannelIndex = -1;
            store.users.length = 0;
            store.messages.length = 0;
        }

        unwatchChannel (channelId);
    });

    type UserKickedOrBanned = {
        channelId: string,
        userId: string,
        kicked: boolean,
        message: string,
    };

    chatSocket.on ("kickedOrBanned", async (params: UserKickedOrBanned) => {
        if (params.userId != me?.id)
            return;

        const channelIndex = store.channels.findIndex ((val) => val.id == params.channelId);
        if (channelIndex == -1)
            return;

        store.channels.splice (channelIndex, 1);

        if (channelIndex == store.selectedChannelIndex)
        {
            store.selectedChannelIndex = -1;
            store.users.length = 0;
            store.messages.length = 0;
        }

        unwatchChannel (params.channelId);
    });

    chatSocket.on ("friendshipChanged", async (userId: string) => {
        const previousConv = store.selectedUser?.id;
        const previousChannel = store.selectedChannel?.id;
        await fetchUserInfo ();
        await fetchPrivateConversations ();

        if (previousConv)
            await selectPrivConv (previousConv)
        else if (previousChannel)
            await selectChannel (previousChannel);
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

    unwatchAllChannels ();
    for (const chan of store.channels)
        watchChannel (chan.id);
}

export async function fetchPrivateConversations ()
{
    const store = useChatStore ();

    const result = await axios.get ("channels/discussions");

    store.privateConvs = result.data;

    unwatchAllConvs ();
    for (const other of store.privateConvs)
        watchPrivConv (other.id);
}

export function notifyChannelChange (channelId: string)
{
    chatSocket.emit ("channelUpdated", channelId);
}

export function notifyUserKickOrBan (channelId: string, userId: string, kicked: boolean, message: string)
{
    chatSocket.emit ("userKickedOrBanned", {channelId: channelId, userId: userId, kicked: kicked, message: message});
}

export function notifyFriendshipChange (userId: string)
{
    chatSocket.emit ("userFriendshipChanged", userId);
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

export function unwatchAllChannels ()
{
    chatSocket.emit ("unwatchAllChannels");
}

export async function selectChannel (channelId: string)
{
    const store = useChatStore ();

    await fetchUsers (channelId);
    await fetchMessages (channelId);

    store.selectedChannelIndex = store.channels.findIndex ((val) => val.id == channelId);
    store.selectedUserIndex = -1;
    store.channelsSelected = true;
}

export function watchPrivConv (userId: string)
{
    chatSocket.emit ("watchPrivConv", userId);
}

export function unwatchPrivConv (userId: string)
{
    chatSocket.emit ("unwatchPrivConv", userId);
}

export function unwatchAllConvs ()
{
    chatSocket.emit ("unwatchAllConvs");
}

export async function selectPrivConv (userId: string)
{
    const chat = useChatStore ();
    const {user: me} = storeToRefs (useUserStore ());

    await fetchPrivateMessages (userId);

    chat.selectedUserIndex = chat.privateConvs.findIndex ((val) => val.id == userId);
    chat.selectedChannelIndex = -1;

    chat.users.length = 0;

    if (chat.selectedUser)
    {
        if (me.value)
            chat.users.push (me.value);
        if (chat.selectedUser)
            chat.users.push (chat.selectedUser);

        chat.users.sort ((a, b) => a.nickname.localeCompare (b.nickname));
    }
}

export async function leaveChannel (newOwnerId?: string)
{
    const chatStore = useChatStore ();
    const {user: me} = storeToRefs (useUserStore ());

    if (!chatStore.selectedChannel || !me.value)
        return;

    await axios.post ("channels/" + chatStore.selectedChannel.id + "/leave", {newOwnerId: newOwnerId});
    notifyChannelChange (chatStore.selectedChannel.id);
    await fetchChannels ();

    clearDiscussions ();
}

export async function deleteChannel ()
{
    const chatStore = useChatStore ();

    if (!chatStore.selectedChannel)
        return;

    await axios.delete ("channels/" + chatStore.selectedChannel.id);
    chatSocket.emit ("channelDeleted", chatStore.selectedChannel.id);
    await fetchChannels ();

    clearDiscussions ();
}

export function clearDiscussions ()
{
    const chatStore = useChatStore ();

    chatStore.selectedChannelIndex = -1;
    chatStore.selectedUserIndex = -1;
    chatStore.users.length = 0;
    chatStore.messages.length = 0;
}
