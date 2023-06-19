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

    const selectedChannel = computed ((): Channel | null =>
    {
        if (selectedChannelIndex.value < 0)
            return null;

        return channels.value[selectedChannelIndex.value];
    });

    return { users, messages, channels, selectedChannelIndex, selectedChannel };
});
