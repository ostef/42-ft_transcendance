import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { User } from "./user";

export type UserInChannel =
{
    isOwner: boolean;
    isAdmin: boolean;
    isMuted: boolean;
    user: User;
}

export type Channel =
{
    id: string;
    name: string;
    description: string;
    users: UserInChannel[];
}

export type Discussion =
{
    isDirect: boolean;
    channel?: Channel;
    otherUser?: User;
}

export type Message =
{
    sender: User;
    content: string;
}

export const useChatStore = defineStore ("chat", () =>
{
    const discussions = ref ([] as Discussion[]);
    const selectedDiscussionIndex = ref (0);
    const messages = ref ([] as Message[]);

    const selectedDiscussion = computed (() =>
        discussions.value.length > 0 ? discussions.value[selectedDiscussionIndex.value] : null);

    function selectDiscussion (index: number)
    {
        selectedDiscussionIndex.value = index;
    }
 
    return { discussions, selectedDiscussionIndex, messages, selectedDiscussion, selectDiscussion };
});
