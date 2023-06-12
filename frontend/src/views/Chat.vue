<script setup lang="ts">

import { reactive, computed, getCurrentInstance, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

import ChatMessage from "@/components/ChatMessage.vue";
import UserAvatar from "@/components/UserAvatar.vue";

import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";
import { chatSocket, connectChatSocket, disconnectChatSocket } from "@/chat";
import { onBeforeRouteLeave } from "vue-router";

const chat = useChatStore ();
const { user } = storeToRefs (useUserStore ());

onMounted (() =>
{
    connectChatSocket ();
    console.log ("Mounted");
});

onBeforeRouteLeave ((to, from, next) =>
{
    disconnectChatSocket ();
    console.log ("Leaving...");
    next ();
});

function selectDiscussionAndLoadMessages (index: number)
{

}

</script>

<template>
    <div class="flex w-full h-3/4">
        <!-- <ChatDiscussionList /> -->
        <div class="w-1/4 overflow-y-auto mx-2 p-4 rounded-lg bg-base-200">
            <button class="btn btn-block normal-case"
                v-for="(disc, index) in chat.discussions"
                :key="index"
                @click="selectDiscussionAndLoadMessages (index)"
            >
                <div v-if="disc.isDirect">
                </div>
                <div v-else>
                    {{ disc.channel?.name }} <br>
                    {{ disc.channel?.description }} <br>
                </div>
            </button>
        </div>

        <div class="w-3/4 mx-2 overflow-hidden rounded-lg bg-base-200">
            <div class="h-1/6 m-4">
                <b><em>#</em></b> {{ chat.selectedDiscussion?.channel?.name }}<br />
                <small><i>{{ chat.selectedDiscussion?.channel?.description }}</i></small>
            </div>

            <div class="overflow-y-auto p-4 h-4/6">
                <ChatMessage v-for="msg of chat.messages"
                    :username="msg.sender.username"
                    :picture="msg.sender.avatarFile"
                    time="12:45"
                    :content="msg.content"
                    :mine="msg.sender.id == user?.id"
                />
            </div>

            <div class="p-4 h-1/6 mt-4">
                <input type="text" placeholder="Write something" class="input input-bordered w-4/6" />
                <button class="btn normal-case mx-4 w-1/6">Send</button>
            </div>
        </div>


        <div class="w-1/4 overflow-y-auto mx-2 p-2 rounded-lg bg-base-200">
            <div class="flex bg-base-300 rounded-lg m-2" v-for="user of chat.users">
                <UserAvatar class="m-2"
                    :userId="user.id" :username="user.username" :picture="user.avatarFile"
                    :isBlocked="user.isBlocked" :isFriend="user.isFriend"
                />

                <div>{{ user.nickname }}</div>

                <!--
                <iconify-icon v-if="user.isOwner" icon="tabler:crown" class="m-1 h-5 w-5" />
                <iconify-icon v-if="user.isAdmin" icon="eos-icons:admin-outlined" class="m-1 h-5 w-5" />
                <iconify-icon v-if="user.isMuted" icon="bx:volume-mute" class="m-1 h-4 w-5" />
                -->
            </div>
        </div>
    </div>
</template>
