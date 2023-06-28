<script setup lang="ts">

import { reactive, computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { useChatStore, type Message } from "@/stores/chat";
import { useUserStore } from "@/stores/user";

import ChatMessage from "@/components/chat/ChatMessage.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import JoinedChannelsList from "@/components/chat/JoinedChannelsList.vue";
import PrivateConversationsList from "@/components/chat/PrivateConversationsList.vue";
import InviteToChannelPopup from "@/components/chat/InviteToChannelPopup.vue";
import ConfirmPopup from "@/components/ConfirmPopup.vue";
import LeaveChannelOwnerPopup from "@/components/chat/LeaveChannelOwnerPopup.vue";

import {
    chatSocket,
    fetchChannels, fetchPrivateConversations,
    leaveChannel, deleteChannel
} from "@/chat";

const chat = useChatStore ();
const { user: me } = storeToRefs (useUserStore ());
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
    <div class="flex w-full top-[6rem] bottom-[10vh] absolute min-h-0 min-w-0">
        <!-- Discussion list -->
        <div class="w-1/4 min-h-0 overflow-hidden mx-2 p-4 rounded-lg bg-base-200">
            <div class="tabs tabs-boxed -mx-2">
                <a class="tab tab-xs sm:tab-md" :class="chat.channelsSelected ? 'tab-active' : ''" @click="chat.channelsSelected = true">Channels</a>
                <a class="tab tab-xs sm:tab-md" :class="!chat.channelsSelected ? 'tab-active' : ''" @click="chat.channelsSelected = false">Users</a>
            </div>

            <JoinedChannelsList v-if="chat.channelsSelected" />
            <PrivateConversationsList v-else />
        </div>

        <div class="w-3/4 h-full min-h-0 mx-2 overflow-hidden rounded-lg bg-base-200">
            <!-- Discussion header -->
            <div class="h-[5rem] flex flex-col p-2 relative">
                <div v-if="chat.selectedChannel" >
                    <div class="hidden lg:inline">
                        <label v-if="chat.selectedChannel && chat.isOwner (me?.id)" for="confirmDeleteChannelModal"
                            class="btn normal-case float-right m-2 bg-red-500 hover:bg-red-600"
                        >
                            <iconify-icon class="w-4 h-4 m-2 text-black text-opacity-60" icon="material-symbols:delete-outline" />
                            <div class="text-black text-opacity-60">
                                Delete
                            </div>
                        </label>

                        <label v-if="chat.selectedChannel" class="btn normal-case float-right m-2" :for="chat.isOwner (me?.id) ? 'leaveChannelOwnerModal' : 'confirmLeaveChannelModal'">
                            <iconify-icon class="w-4 h-4 m-2" icon="pepicons-pop:leave" />
                            <div>
                                Leave
                            </div>
                        </label>

                        <label v-if="chat.selectedChannel?.isPrivate" for="inviteToChannelModal"
                            class="btn normal-case float-right m-2 bg-green-500 hover:bg-green-600"
                        >
                            <iconify-icon class="w-4 h-4 m-2 text-black text-opacity-60" icon="mdi:invite" />
                            <div class="text-black text-opacity-60">
                                Invite
                            </div>
                        </label>
                    </div>
                    <div class="lg:hidden float-right">
                        <div class="dropdown dropdown-left flex">
                            <label tabindex="0" class="p-3 m-2 hover:bg-gray-400 hover:text-black rounded-full">
                                <iconify-icon icon="simple-line-icons:options-vertical" class="h-5 w-5" />
                            </label>
                            <ul tabindex="0" class="menu menu-compact dropdown-content rounded-md shadow bg-base-100">
                                <li v-if="chat.selectedChannel?.isPrivate"><label for="inviteToChannelModal"
                                    class="normal-case"
                                >
                                    <iconify-icon class="w-4 h-4 m-2" icon="mdi:invite" />
                                    <div>
                                        Invite
                                    </div>
                                </label></li>
                                <li v-if="chat.selectedChannel"><label class="normal-case" :for="chat.isOwner (me?.id) ? 'leaveChannelOwnerModal' : 'confirmLeaveChannelModal'">
                                    <iconify-icon class="w-4 h-4 m-2" icon="pepicons-pop:leave" />
                                    <div>
                                        Leave
                                    </div>
                                </label></li>
                                <li v-if="chat.selectedChannel && chat.isOwner (me?.id)"><label for="confirmDeleteChannelModal"
                                    class="normal-case"
                                >
                                    <iconify-icon class="w-4 h-4 m-2" icon="material-symbols:delete-outline" />
                                    <div>
                                        Delete
                                    </div>
                                </label></li>
                            </ul>
                        </div>
                    </div>

                    <ConfirmPopup id="confirmDeleteChannelModal" title="Delete Channel ?" @on-yes="deleteChannel ()" />
                    <ConfirmPopup id="confirmLeaveChannelModal" title="Leave Channel ?" @on-yes="leaveChannel ()" />
                    <LeaveChannelOwnerPopup />
                    <InviteToChannelPopup />

                    <div class="flex flex-col ml-6 my-2 overflow-hidden">
                        <h3 class="text-lg select-none truncate">{{ chat.selectedChannel?.name }}</h3>
                        <h3 class="text-sm select-none truncate">{{ chat.selectedChannel?.description }}</h3>
                    </div>
                </div>
                <div class="flex flex-row" v-else-if="chat.selectedUser">
                    <div class="my-2 mx-4">
                        <UserAvatar :user="chat.selectedUser" />
                    </div>
                    <div class="flex flex-col my-2">
                        <h3 class="text-lg select-none">
                        {{ chat.selectedUser?.nickname }}
                        <iconify-icon v-if="chat.selectedUser?.hasBlockedYou" icon="fluent:presence-blocked-20-regular" />
                        </h3>
                        <h3 class="text-sm select-none">{{ chat.selectedUser?.username }}</h3>
                    </div>
                </div>
            </div>

            <div class="h-custom-middle flex flex-col-reverse overflow-hidden">
                <!-- Message input -->
                <div v-if="chat.selectedChannelIndex != -1 || chat.selectedUserIndex != -1"
                    class="p-4 h-auto mt-4 flex flex-row-reverse"
                >
                    <button
                        :disabled="chat.isMuted (me?.id)"
                        class="btn normal-case mx-4 p-4" @click="sendMessage ()">
                        Send
                    </button>
                    <input type="text"
                        :placeholder="chat.isMuted (me?.id) ? 'You are muted' : 'Write something'"
                        class="input input-bordered w-full"
                        :disabled="chat.isMuted (me?.id)"
                        v-model="messageToSend" @keyup.enter="sendMessage ()"
                    />
                </div>

                <!-- Messages -->
                <div class="overflow-y-auto overflow-x-hidden p-4 min-h-0 h-full flex flex-col-reverse">
                    <div v-if="chat.selectedChannelIndex != -1 || chat.selectedUserIndex != -1">
                        <ChatMessage v-for="msg of chat.messages"
                            :channelId="chat.selectedChannel?.id"
                            :message="msg"
                        />
                    </div>
                </div>
            </div>

        </div>

        <!-- Users -->
        <div class="w-1/4 min-h-0 overflow-y-auto overflow-x-hidden mx-2 p-2 rounded-lg bg-base-200">
            <div class="flex m-2 justify-center lg:justify-start" v-for="user of chat.users">
                <div class="my-2 mx-4">
                    <UserAvatar :channelId="chat.selectedChannel?.id" :user="user" />
                </div>
                <div class="hidden lg:flex flex-col my-2">
                    <h3 class="text-sm md:text-lg select-none flex flex-row">
                        {{ user.nickname }}
                        <iconify-icon class="mx-2 my-1 w-5 h-5" v-if="chat.isOwner (user.id)" icon="tabler:crown"  />
                        <iconify-icon class="mx-2 my-1 w-5 h-5" v-else-if="chat.isAdmin (user.id)" icon="eos-icons:admin-outlined" />
                        <iconify-icon class="mx-2 my-1 w-5 h-5" v-if="chat.isMuted (user.id)" icon="solar:muted-linear" />
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
