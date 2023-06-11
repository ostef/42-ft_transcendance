import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type User =
{
    id: string;
    avatarFile: string;
    username: string;
    nickname: string;
    isFriend: boolean;
    isBlocked: boolean;
}

export const useUserStore = defineStore ("user", () =>
{
    const user = ref (null as User | null);

    return { user };
});
