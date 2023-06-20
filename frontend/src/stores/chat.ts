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

export type Message =
{
    sender: User;
    content: string;
    date: Date;
}

export const useChatStore = defineStore ("chat", () =>
{
    const messages = ref ([] as Message[]);
    const users = ref ([] as User[]);
    const channels = ref ([] as Channel[]);
    const selectedChannelIndex = ref (-1);
    const selectedUserIndex = ref (-1);
    const privateConvs = ref ([] as User[]);
    const channelsSelected = ref (false);
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

    function isOnline (userId: string): boolean
    {
        return onlineUsers.value.findIndex ((val) => val == userId) != -1;
    }

    return {
        users, messages, channels, privateConvs,
        selectedChannelIndex, selectedChannel, selectedUserIndex, selectedUser,
        channelsSelected, onlineUsers, isOnline };
});
