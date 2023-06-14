<script setup lang="ts">

import { reactive, computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import ChatMessage from "@/components/ChatMessage.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import JoinChannelPopup from "@/components/JoinChannelPopup.vue";
import CreateChannelPopup from "@/components/CreateChannelPopup.vue";

import { useChatStore, type Message } from "@/stores/chat";
import { useUserStore } from "@/stores/user";

import {
    chatSocket, connectChatSocket, disconnectChatSocket,
    fetchChannels, fetchUsers, watchChannel, unwatchChannel, fetchMessages
} from "@/chat";

import { onBeforeRouteLeave } from "vue-router";

const chat = useChatStore ();
const { user } = storeToRefs (useUserStore ());
const messageToSend = ref ("");

onMounted (() =>
{
    connectChatSocket ();
    fetchChannels ();
});

onBeforeRouteLeave ((to, from, next) =>
{
    disconnectChatSocket ();
    next ();
});

function sendMessage ()
{
    if (!chat.selectedChannel)
        return;

    if (messageToSend.value.length == 0)
        return;

    chatSocket.emit ("newMessage", {
        channelId: chat.selectedChannel.id,
        content: messageToSend.value
    });

    messageToSend.value = "";
}

async function selectChannel (channelId: string)
{
    await fetchUsers (channelId);
    await fetchMessages (channelId);

    if (chat.selectedChannel)
        unwatchChannel (chat.selectedChannel.id);

    watchChannel (channelId);
    chat.selectedChannelIndex = chat.channels.findIndex ((val) => val.id == channelId);
}

function getMessageDateTimeString (msg: Message)
{
    const now = new Date ();
    const date = new Date (msg.date);

    if (date.getDate () != now.getDate ()
    || date.getMonth () != now.getMonth ()
    || date.getFullYear () != now.getFullYear ())
        return date.toLocaleString ();

    return date.toLocaleTimeString ();
}

</script>

<template>
    <div class="flex w-full h-3/4">
        <div class="w-1/4 overflow-y-auto mx-2 p-4 rounded-lg bg-base-200">
            <label for="joinChannelModal" class="btn btn-block normal-case my-2">
                Join Channel
            </label>
            <JoinChannelPopup />

            <label for="createChannelModal" class="btn btn-block normal-case my-2">
                Create Channel
            </label>
            <CreateChannelPopup />

            <button class="btn btn-block normal-case my-2"
                v-for="(chan, index) in chat.channels"
                :key="index"
                @click="selectChannel (chan.id)"
            >
                {{ chan.name }}
            </button>
        </div>

        <div class="w-3/4 mx-2 overflow-hidden rounded-lg bg-base-200">
            <div class="h-1/6">
                {{ chat.selectedChannel?.name }} <br>
                {{ chat.selectedChannel?.description }}
            </div>

            <div class="overflow-y-auto p-4 h-4/6 flex flex-col-reverse">
                <div>
                    <ChatMessage v-for="msg of chat.messages"
                        :userId="msg.sender.id"
                        :username="msg.sender.username"
                        :nickname="msg.sender.nickname"
                        :picture="msg.sender.avatarFile"
                        :online="msg.sender.isOnline"
                        :isBlocked="msg.sender.isBlocked"
                        :isFriend="msg.sender.isFriend"
                        :time="getMessageDateTimeString (msg)"
                        :content="msg.content"
                        :mine="msg.sender.id == user?.id"
                    />
                </div>
            </div>

            <div class="p-4 h-1/6 mt-4">
                <input type="text" placeholder="Write something" class="input input-bordered w-4/6" v-model="messageToSend" @keyup.enter="sendMessage ()" />
                <button class="btn normal-case mx-4 w-1/6" @click="sendMessage ()">Send</button>
            </div>
        </div>


        <div class="w-1/4 overflow-y-auto mx-2 p-2 rounded-lg bg-base-200">
            <div class="flex bg-base-300 rounded-lg m-2" v-for="user of chat.users">
                <UserAvatar class="m-2"
                    :userId="user.id"
                    :username="user.username"
                    :nickname="user.nickname"
                    :picture="user.avatarFile"
                    :isBlocked="user.isBlocked" :isFriend="user.isFriend" :isOnline="user.isOnline"
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
