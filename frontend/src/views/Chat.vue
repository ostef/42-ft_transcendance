<script setup lang="ts">

import { reactive, computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import ChatMessage from "@/components/ChatMessage.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import JoinedChannelsList from "@/components/JoinedChannelsList.vue";
import PrivateConversationsList from "@/components/PrivateConversationsList.vue";

import { useChatStore, type Message } from "@/stores/chat";
import { useUserStore } from "@/stores/user";

import {
    chatSocket, connectChatSocket, disconnectChatSocket,
    fetchChannels, fetchUsers, watchChannel, unwatchChannel, fetchMessages, fetchPrivateConversations
} from "@/chat";

import { onBeforeRouteLeave } from "vue-router";

const chat = useChatStore ();
const { user: me } = storeToRefs (useUserStore ());
const messageToSend = ref ("");

onMounted (async () =>
{
    connectChatSocket ();
    await fetchChannels ();
    await fetchPrivateConversations ();
});

onBeforeRouteLeave ((to, from, next) =>
{
    disconnectChatSocket ();
    next ();
});

function sendMessage ()
{
    if (messageToSend.value.length == 0)
        return;

    if (chat.channelsSelected && chat.selectedChannel)
    {
        chatSocket.emit ("newMessage", {
            channelId: chat.selectedChannel.id,
            content: messageToSend.value
        });
    }
    if (!chat.channelsSelected && chat.selectedUser)
    {
        chatSocket.emit ("newMessage", {
            userId: chat.selectedUser.id,
            content: messageToSend.value
        });
    }

    messageToSend.value = "";
}

</script>

<template>
    <div class="flex w-full h-3/4">
        <div class="w-1/4 overflow-y-auto mx-2 p-4 rounded-lg bg-base-200">
            <div class="tabs tabs-boxed">
                <a class="tab" :class="chat.channelsSelected ? 'tab-active' : ''" @click="chat.channelsSelected = true">Channels</a>
                <a class="tab" :class="!chat.channelsSelected ? 'tab-active' : ''" @click="chat.channelsSelected = false">Users</a>
            </div>

            <JoinedChannelsList v-if="chat.channelsSelected" />
            <PrivateConversationsList v-else />
        </div>

        <div class="w-3/4 mx-2 overflow-hidden rounded-lg bg-base-200">
            <div class="h-1/6 flex-col">
                <div v-if="chat.selectedChannel">
                    {{ chat.selectedChannel?.name }} <br>
                    {{ chat.selectedChannel?.description }}
                </div>
                <div v-else-if="chat.selectedUser">
                    {{ chat.selectedUser?.nickname }} ({{ chat.selectedUser?.username }})
                </div>
            </div>

            <div class="overflow-y-auto p-4 h-4/6 flex flex-col-reverse">
                <div v-if="chat.selectedChannelIndex != -1 || chat.selectedUserIndex != -1">
                    <ChatMessage v-for="msg of chat.messages"
                        :channelId="chat.selectedChannel?.id"
                        :message="msg"
                        :online="chat.isOnline (msg.sender.id)"
                        :isAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == msg.sender.id) != -1"
                        :isMuted="chat.selectedChannel?.mutedUserIds.findIndex ((val) => val == msg.sender.id) != -1"
                        :iAmAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == me?.id) != -1"
                    />
                </div>
            </div>

            <div v-if="chat.selectedChannelIndex != -1 || chat.selectedUserIndex != -1" class="p-4 h-1/6 mt-4">
                <input type="text" placeholder="Write something" class="input input-bordered w-4/6" v-model="messageToSend" @keyup.enter="sendMessage ()" />
                <button class="btn normal-case mx-4 w-1/6" @click="sendMessage ()">Send</button>
            </div>
        </div>


        <div class="w-1/4 overflow-y-auto mx-2 p-2 rounded-lg bg-base-200">
            <div class="flex bg-base-300 rounded-lg m-2" v-for="user of chat.users">
                <UserAvatar class="m-2"
                    :channelId="chat.selectedChannel?.id"
                    :user="user"
                    :isOnline="chat.isOnline (user.id)"
                    :isAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == user.id) != -1"
                    :isMuted="chat.selectedChannel?.mutedUserIds.findIndex ((val) => val == user.id) != -1"
                    :iAmAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == me?.id) != -1"
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
