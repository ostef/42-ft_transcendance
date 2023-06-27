<script setup lang="ts">

import { onMounted, ref } from 'vue';
import axios from 'axios';

import { type User } from '@/stores/user';
import { useChatStore } from '@/stores/chat';
import { selectPrivConv } from '@/chat';

import NonInteractiveAvatar from "./NonInteractiveAvatar.vue";

const friends = ref ([] as User[]);

async function fetchFriends ()
{
    const result = await axios.get ("user/friends");

    friends.value = result.data;
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
            <h3 class="text-lg font-bold">Start Conversation</h3>

            <button class="btn normal-case m-2" v-for="friend of friends" @click="startConversation (friend)">
                <NonInteractiveAvatar :user="friend" /> {{ friend.nickname }} ({{ friend.username }})
            </button>

            <label class="btn normal-case m-2" for="startConversationModal">Close</label>
        </div>
    </div>
</template>
