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

export const useUserStore = defineStore ("user", () =>
{
    const user = ref (null as User | null);

    return { user };
});
