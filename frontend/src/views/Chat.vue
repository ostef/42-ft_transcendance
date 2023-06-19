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

onMounted (async () =>
{
    connectChatSocket ();
    await fetchChannels ();
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
                        :channelId="chat.selectedChannel?.id"
                        :user="msg.sender"
                        :message="msg"
                        :online="msg.sender.isOnline"
                        :isAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == msg.sender.id) != -1"
                        :isMuted="chat.selectedChannel?.mutedUserIds.findIndex ((val) => val == msg.sender.id) != -1"
                        :iAmAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == user?.id) != -1"
                    />
                </div>
            </div>

            <div class="p-4 h-1/6 mt-4">
                <input type="text" placeholder="Write something" class="input input-bordered w-4/6" v-model="messageToSend" @keyup.enter="sendMessage ()" />
                <button class="btn normal-case mx-4 w-1/6" @click="sendMessage ()">Send</button>
            </div>
        </div>


        <div class="w-1/4 overflow-y-auto mx-2 p-2 rounded-lg bg-base-200">
            <div class="flex bg-base-300 rounded-lg m-2" v-for="u of chat.users">
                <UserAvatar class="m-2"
                    :channelId="chat.selectedChannel?.id"
                    :user="u"
                    :isAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == u.id) != -1"
                    :isMuted="chat.selectedChannel?.mutedUserIds.findIndex ((val) => val == u.id) != -1"
                    :iAmAdmin="chat.selectedChannel?.adminIds.findIndex ((val) => val == user?.id) != -1"
                />

                <div>{{ u.nickname }}</div>

                <!--
                <iconify-icon v-if="user.isOwner" icon="tabler:crown" class="m-1 h-5 w-5" />
                <iconify-icon v-if="user.isAdmin" icon="eos-icons:admin-outlined" class="m-1 h-5 w-5" />
                <iconify-icon v-if="user.isMuted" icon="bx:volume-mute" class="m-1 h-4 w-5" />
                -->
            </div>
        </div>
    </div>
</template>
