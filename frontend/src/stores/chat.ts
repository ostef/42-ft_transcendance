import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { User } from "./user";

export type UserInChannel =
{
    isAdmin: boolean;
    isMuted: boolean;
    user: User;
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

export const useChatStore = defineStore ("chat", () =>
{
    const messages = ref ([] as Message[]);
    const users = ref ([] as User[]);
    const channels = ref ([] as Channel[]);
    const selectedChannelIndex = ref (-1);
    const selectedUserIndex = ref (-1);
    const privateConvs = ref ([] as User[]);
    const channelsSelected = ref (true);
    const onlineUsers = ref ([] as string[]); // These are all user ids

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

    return {
        users, messages, channels, privateConvs,
        selectedChannelIndex, selectedChannel, selectedUserIndex, selectedUser,
        channelsSelected, onlineUsers,
        isOnline, isMuted, isAdmin, isOwner, hasPrivConv
    };
});
