<script setup lang="ts">

import { reactive, computed } from "vue";

import ChatMessage from "../components/ChatMessage.vue";

import { useChatStore } from "../stores/chat";
import { useUserStore } from "../stores/user";

const chat = useChatStore ();
const user = useUserStore ();

</script>

<template>
    <div class="flex w-full h-3/4">
        <!-- <ChatDiscussionList /> -->
        <div class="w-1/4 overflow-y-auto mx-2 p-4 rounded-lg bg-base-200">
            <div v-for="disc of chat.discussions">
                <div v-if="disc.isDirect">
                </div>
                <div v-else>
                    {{ disc.channel?.name }} <br>
                    {{ disc.channel?.description }} <br>
                </div>
            </div>
        </div>

        <div class="w-3/4 mx-2 overflow-hidden rounded-lg bg-base-200">
            <div class="overflow-y-auto p-4 h-5/6">
                <ChatMessage v-for="msg of chat.messages"
                    :username="msg.sender.username"
                    :picture="msg.sender.profilePictureUrl"
                    time="12:45"
                    :content="msg.content"
                    :mine="msg.sender.id == user.user.id"
                />
            </div>

            <div class="p-4 h-1/6 mt-4">
                <input type="text" placeholder="Write something" class="input input-bordered w-4/6" />
                <button class="btn normal-case mx-4 w-1/6">Send</button>
            </div>
        </div>


        <div class="w-1/4 overflow-y-auto mx-2 p-4 rounded-lg bg-base-200">
        </div>
    </div>
</template>
