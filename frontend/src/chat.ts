import { Socket, io } from "socket.io-client";
import axios from "axios";

import { useStore, type User } from "@/store";
import { fetchUserInfo } from "@/authentication";

export let chatSocket: Socket;

export function connectChatSocket ()
{
    const store = useStore ();

    if (chatSocket && chatSocket.connected)
        return;

    chatSocket = io (
        "http://localhost:3000/chat",
        {
            auth: { token: localStorage.getItem ("token") },
        }
    );

    function handleError (err: Error)
    {
        console.log (err);
        store.pushAlert ("error", err.message);
    }

    chatSocket.on ("connect_error", handleError);
    chatSocket.on ("connection_error", handleError);
    chatSocket.on ("exception", handleError);
    chatSocket.on ("error", err => store.pushAlert ("error", err));

    chatSocket.on ("newMessage", async (msg) => {
        if (msg.toUser && !store.hasPrivConv (msg.sender) && !store.hasPrivConv (msg.toUser))
        {
            const prevConv = store.selectedUser?.id;

            await fetchPrivateConversations ();

            if (prevConv)
                selectPrivConv (prevConv);
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
        if (params.userId != store.loggedUser?.id)
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
    const store = useStore ();

    const result = await axios.get ("channels/joined");

    store.channels = result.data;

    unwatchAllChannels ();
    for (const chan of store.channels)
        watchChannel (chan.id);
}

export async function fetchPrivateConversations ()
{
    const store = useStore ();

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
    const store = useStore ();

    const index = store.channels.findIndex ((val) => val.id == channelId);

    if (index != -1)
    {
        const result = await axios.get ("channels/" + channelId);

        store.channels[index] = result.data;
    }
}

export async function fetchUsers (channelId: string)
{
    const store = useStore ();

    const result = await axios.get ("channels/" + channelId + "/users");

    store.users = result.data;
}

export async function fetchMessages (channelId: string)
{
    const store = useStore ();

    const result = await axios.get ("channels/" + channelId + "/messages");

    store.messages = result.data;
}

export async function fetchPrivateMessages (otherId: string)
{
    const store = useStore ();

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
    const store = useStore ();

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
    const store = useStore ();

    await fetchPrivateMessages (userId);

    store.selectedUserIndex = store.privateConvs.findIndex ((val) => val.id == userId);
    store.selectedChannelIndex = -1;

    store.users.length = 0;

    if (store.selectedUser)
    {
        if (store.loggedUser)
            store.users.push (store.loggedUser);
        if (store.selectedUser)
            store.users.push (store.selectedUser);

        store.users.sort ((a, b) => a.nickname.localeCompare (b.nickname));
    }
}

export async function leaveChannel (newOwnerId?: string)
{
    const store = useStore ();

    if (!store.selectedChannel || !store.loggedUser)
        return;

    await axios.post ("channels/" + store.selectedChannel.id + "/leave", {newOwnerId: newOwnerId});
    notifyChannelChange (store.selectedChannel.id);
    await fetchChannels ();

    clearDiscussions ();
}

export async function deleteChannel ()
{
    const store = useStore ();

    if (!store.selectedChannel)
        return;

    await axios.delete ("channels/" + store.selectedChannel.id);
    chatSocket.emit ("channelDeleted", store.selectedChannel.id);
    await fetchChannels ();

    clearDiscussions ();
}

export function clearDiscussions ()
{
    const store = useStore ();

    store.selectedChannelIndex = -1;
    store.selectedUserIndex = -1;
    store.users.length = 0;
    store.messages.length = 0;
}
