<script setup lang="ts">
import { selectChannel } from "@/chat";
import { useChatStore } from "@/stores/chat";

import JoinChannelPopup from "./JoinChannelPopup.vue";
import CreateChannelPopup from "./CreateChannelPopup.vue";

const chat = useChatStore ();

</script>

<template>
    <button class="btn btn-block normal-case my-2"
        v-for="(chan, index) in chat.channels"
        :key="index"
        @click="selectChannel (chan.id)"
    >
        {{ chan.name }}
    </button>

    <div class="flex">
        <label for="joinChannelModal" class="btn normal-case my-2 mx-2">
            Join Channel
        </label>
        <JoinChannelPopup />

        <label for="createChannelModal" class="btn normal-case my-2 mx-2">
            Create Channel
        </label>
        <CreateChannelPopup />
    </div>
</template>
