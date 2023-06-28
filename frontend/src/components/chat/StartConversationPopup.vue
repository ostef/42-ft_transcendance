<script setup lang="ts">

import { onMounted, ref } from 'vue';
import axios from 'axios';

import { type User } from '@/stores/user';
import { useChatStore } from '@/stores/chat';
import { selectPrivConv } from '@/chat';

import UserSelectionList from "./UserSelectionList.vue";

const friends = ref ([] as User[]);

async function fetchFriends ()
{
    const chatStore = useChatStore ();
    const result = await axios.get ("user/friends");

    friends.value.length = 0;
    for (const friend of result.data)
    {
        if (!chatStore.hasPrivConv (friend.id))
            friends.value.push (friend);
    }
}

async function startConversation (user: User)
{
    const chatStore = useChatStore ();
    const index = chatStore.privateConvs.findIndex ((val) => val.id == user.id);
    if (index == -1)
        chatStore.privateConvs.push (user);

    await selectPrivConv (user.id);
}

</script>

<template>
    <input type="checkbox" id="startConversationModal" class="modal-toggle" @change="fetchFriends ()" />
    <div class="modal">
        <div class="modal-box w-xs h-lg grid">
            <div class="block">
                <label class="float-right btn rounded-full" for="startConversationModal">
                    <iconify-icon class="w-4 h-4" icon="gg:close" />
                </label>

                <h3 class="text-lg font-bold select-none">Start Conversation</h3>
            </div>

            <UserSelectionList :users="friends" @on-select="startConversation"/>
        </div>
    </div>
</template>
