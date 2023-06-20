<script setup lang="ts">
import { fetchUsers, fetchMessages, unwatchChannel, watchChannel, fetchPrivateMessages, selectPrivConv } from "@/chat";
import { useChatStore } from "@/stores/chat";

import StartConversationPopup from "./StartConversationPopup.vue";

const chat = useChatStore ();

</script>

<template>
    <button class="btn btn-block normal-case my-2"
        v-for="(user, index) in chat.privateConvs"
        :key="index"
        @click="selectPrivConv (user.id)"
    >
        {{ user.nickname }} ({{ user.username }})
    </button>

    <div class="flex">
        <label for="startConversationModal" class="btn normal-case my-2 mx-2">
            Start Conversation
        </label>
        <StartConversationPopup />
    </div>
</template>
