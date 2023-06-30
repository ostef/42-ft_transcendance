<script setup lang="ts">

import { onMounted, ref } from "vue";

import { useStore, type Message } from "@/store";

import ChatMessage from "@/components/chat/ChatMessage.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import JoinedChannelsList from "@/components/chat/JoinedChannelsList.vue";
import PrivateConversationsList from "@/components/chat/PrivateConversationsList.vue";
import ChannelHeader from "@/components/chat/ChannelHeader.vue";

import {
    chatSocket,
    fetchChannels, fetchPrivateConversations,
} from "@/chat";

const store = useStore ();
const messageToSend = ref ("");

onMounted (async () =>
{
    await fetchChannels ();
    await fetchPrivateConversations ();
});

function sendMessage ()
{
    if (messageToSend.value.length == 0)
        return;

    if (store.channelsSelected && store.selectedChannel)
    {
        chatSocket.emit ("newMessage", {
            channelId: store.selectedChannel.id,
            content: messageToSend.value
        });
    }
    if (!store.channelsSelected && store.selectedUser)
    {
        chatSocket.emit ("newMessage", {
            userId: store.selectedUser.id,
            content: messageToSend.value
        });
    }

    messageToSend.value = "";
}

</script>

// @Todo: rework smartphone sized screens

<template>
    <div class="flex w-full top-[6rem] bottom-[10vh] absolute min-h-0 min-w-0 px-1">
        <!-- Discussion list -->
        <div class="w-1/4 min-h-0 overflow-hidden mx-1 p-4 rounded-lg bg-base-200">
            <div class="tabs tabs-boxed -mx-2">
                <a class="tab tab-xs sm:tab-md" :class="store.channelsSelected ? 'tab-active' : ''" @click="store.channelsSelected = true">Channels</a>
                <a class="tab tab-xs sm:tab-md" :class="!store.channelsSelected ? 'tab-active' : ''" @click="store.channelsSelected = false">Users</a>
            </div>

            <JoinedChannelsList v-if="store.channelsSelected" />
            <PrivateConversationsList v-else />
        </div>

        <div class="w-3/4 h-full min-h-0 mx-1 overflow-hidden rounded-lg bg-base-200">
            <!-- Discussion header -->
            <div class="h-[5rem] flex flex-col p-2 relative">
                <div v-if="store.selectedChannel" >
                    <ChannelHeader />
                </div>
                <div class="flex flex-row" v-else-if="store.selectedUser">
                    <div class="my-2 mx-4">
                        <UserAvatar :user="store.selectedUser" dropdownClass="dropdown-right" />
                    </div>
                    <div class="flex flex-col my-2">
                        <h3 class="flex flex-row text-lg select-none">
                            {{ store.selectedUser?.nickname }}
                            <iconify-icon v-if="store.selectedUser?.hasBlockedYou" class="mx-2 my-1" icon="fluent:presence-blocked-20-regular" />
                        </h3>
                        <h3 class="text-sm select-none">{{ store.selectedUser?.username }}</h3>
                    </div>
                </div>
            </div>

            <div class="h-custom-middle flex flex-col-reverse overflow-hidden">
                <!-- Message input -->
                <div v-if="store.selectedChannelIndex != -1 || store.selectedUserIndex != -1"
                    class="p-4 h-auto mt-4 flex flex-row-reverse"
                >
                    <button
                        :disabled="store.isMuted (store.loggedUser?.id)"
                        class="btn normal-case mx-4 p-4" @click="sendMessage ()">
                        Send
                    </button>
                    <input type="text"
                        :placeholder="store.isMuted (store.loggedUser?.id) ? 'You are muted' : 'Write something'"
                        class="input input-bordered w-full"
                        :disabled="store.isMuted (store.loggedUser?.id)"
                        v-model="messageToSend" @keyup.enter="sendMessage ()"
                    />
                </div>

                <!-- Messages -->
                <div class="overflow-y-auto overflow-x-hidden p-4 min-h-0 h-full flex flex-col-reverse">
                    <h3 v-if="store.selectedUser?.hasBlockedYou" class="text-sm m-4 italic select-none">
                        This user has blocked you, you will not see or receive any messages from them
                    </h3>
                    <div v-else-if="store.selectedChannelIndex != -1 || store.selectedUserIndex != -1">
                        <ChatMessage v-for="msg of store.messages"
                            :key="msg.sender.id + msg.date.toString ()"
                            :channelId="store.selectedChannel?.id"
                            :message="msg"
                        />
                    </div>
                </div>
            </div>

        </div>

        <!-- Users -->
        <div class="w-1/4 min-h-0 overflow-x-hidden overflow-y-auto mx-1 p-2 rounded-lg bg-base-200">
            <div class="flex m-2 justify-center lg:justify-start" v-for="user of store.users" :key="user.id">
                <div class="my-2 mx-4">
                    <UserAvatar :channelId="store.selectedChannel?.id" :user="user" dropdownClass="dropdown-bottom" />
                </div>
                <div class="hidden lg:flex flex-col my-2">
                    <h3 class="text-sm md:text-lg select-none flex flex-row">
                        {{ user.nickname }}
                        <iconify-icon class="mx-2 my-1 w-5 h-5" v-if="store.isOwner (user.id)" icon="tabler:crown"  />
                        <iconify-icon class="mx-2 my-1 w-5 h-5" v-else-if="store.isAdmin (user.id)" icon="eos-icons:admin-outlined" />
                        <iconify-icon class="mx-2 my-1 w-5 h-5" v-if="store.isMuted (user.id)" icon="solar:muted-linear" />
                    </h3>
                    <h3 class="text-sm select-none">{{ user.username }}</h3>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.h-custom-middle
{
    height: calc(100% - 5rem);
}

</style>
