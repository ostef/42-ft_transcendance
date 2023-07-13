import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type User =
{
    id: string;
    avatarFile: string;
    username: string;
    nickname: string;
    receivedFriendRequests: string[];
    isFriend: boolean;
    isBlocked: boolean;
    isOnline: boolean;
    hasBlockedYou: boolean;
}

export type Channel =
{
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isPasswordProtected: boolean;
    ownerId: string;
    adminIds: string[];
    mutedUserIds: string[];
}

export type ChannelInvite =
{
    id: string;
    channel: Channel;
    accepted: boolean;
    expirationDate: Date;
}

export type Message =
{
    sender: User;
    content: string;
    date: Date;
    channelInvite?: ChannelInvite;
}

export type AlertType = "info" | "success" | "warning" | "error";

export type Alert =
{
    type: AlertType;
    message: string;
}

export const useStore = defineStore ("global", () =>
{
    const loggedUser = ref (null as User | null);
    const messages = ref ([] as Message[]);
    const users = ref ([] as User[]);
    const channels = ref ([] as Channel[]);
    const selectedChannelIndex = ref (-1);
    const selectedUserIndex = ref (-1);
    const privateConvs = ref ([] as User[]);
    const channelsSelected = ref (true);
    const onlineUsers = ref ([] as string[]); // These are all user ids
    const alerts = ref ([] as Alert[]);

    const selectedChannel = computed ((): Channel | null =>
    {
        if (selectedChannelIndex.value < 0)
            return null;

        return channels.value[selectedChannelIndex.value];
    });

    const selectedUser = computed ((): User | null =>
    {
        if (selectedUserIndex.value < 0)
            return null;

        return privateConvs.value[selectedUserIndex.value];
    });

    function isOnline (userId?: string): boolean
    {
        if (!userId)
            return false;

        return onlineUsers.value.findIndex ((val) => val == userId) != -1;
    }

    function isMuted (userId?: string, channel: Channel | null = null): boolean
    {
        if (!channel)
            channel = selectedChannel.value;

        if (!channel || !userId)
            return false;

        return channel.mutedUserIds.findIndex ((val) => val == userId) != -1;
    }

    function isAdmin (userId?: string, channel: Channel | null = null): boolean
    {
        if (!channel)
            channel = selectedChannel.value;

        if (!channel || !userId)
            return false;

        return channel.adminIds.findIndex ((val) => val == userId) != -1;
    }

    function isOwner (userId?: string, channel: Channel | null = null): boolean
    {
        if (!channel)
            channel = selectedChannel.value;

        if (!channel || !userId)
            return false;

        return channel.ownerId == userId;
    }

    function hasPrivConv (userId: string)
    {
        return privateConvs.value.findIndex (val => val.id == userId) != -1;
    }

    function pushAlert (type: AlertType, message: string)
    {
        switch (type)
        {
        case "info":
            console.info (message);
            break;
        case "success":
            console.info (message);
            break;
        case "warning":
            console.warn (message);
            break;
        case "error":
            console.error (message);
            break;
        }

        alerts.value.push ({type, message});
        setTimeout (() => { if (alerts.value.length != 0) alerts.value.splice (0, 1); }, 5000);
    }

    function resetChat ()
    {
        users.value.length = 0;
        messages.value.length = 0;
        channels.value.length = 0;
        privateConvs.value.length = 0;
        selectedChannelIndex.value = -1;
        selectedUserIndex.value = -1;
        channelsSelected.value = true;
        onlineUsers.value.length = 0;
    }

    return {
        loggedUser,
        users, messages, channels, privateConvs,
        selectedChannelIndex, selectedChannel, selectedUserIndex, selectedUser,
        channelsSelected, onlineUsers,
        isOnline, isMuted, isAdmin, isOwner, hasPrivConv,
        resetChat,
        alerts, pushAlert
    };
});
