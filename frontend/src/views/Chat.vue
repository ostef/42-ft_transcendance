<script setup lang="ts">

import { reactive, computed, getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";

import ChatMessage from "@/components/ChatMessage.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import JoinedChannelsList from "@/components/JoinedChannelsList.vue";
import PrivateConversationsList from "@/components/PrivateConversationsList.vue";
import InviteToChannelPopup from "@/components/InviteToChannelPopup.vue";
import ConfirmPopup from "@/components/ConfirmPopup.vue";
import LeaveChannelOwnerPopup from "@/components/LeaveChannelOwnerPopup.vue";
import ChannelMenu from "@/components/ChannelMenu.vue";
import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";

import { useChatStore, type Message } from "@/stores/chat";
import { useUserStore } from "@/stores/user";

import {
    chatSocket,
    fetchChannels, fetchPrivateConversations,
    leaveChannel, deleteChannel
} from "@/chat";

import { onBeforeRouteLeave } from "vue-router";
import axios from "axios";

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
                    <label v-if="chat.selectedChannel?.isPrivate" class="btn normal-case float-right m-2" for="inviteToChannelModal">
                        Invite To Channel
                    </label>
                    <InviteToChannelPopup />

                    <label v-if="chat.selectedChannel && !chat.isOwner (me?.id)" class="btn normal-case float-right m-2" for="confirmLeaveChannelModal">
                        Leave Channel
                    </label>
                    <ConfirmPopup id="confirmLeaveChannelModal" title="Leave Channel?" @on-yes="leaveChannel ()" />

                    <label v-if="chat.selectedChannel && chat.isOwner (me?.id)" class="btn normal-case float-right m-2" for="leaveChannelOwnerModal">
                        Leave Channel
                    </label>
                    <LeaveChannelOwnerPopup />

                    <label v-if="chat.selectedChannel && chat.isOwner (me?.id)" class="btn normal-case float-right m-2" for="confirmDeleteChannelModal">
                        Delete Channel
                    </label>
                    <ConfirmPopup id="confirmDeleteChannelModal" title="Delete Channel?" @on-yes="deleteChannel ()" />

                    <input type="checkbox" id="leaveChannelOwnerModal" class="modal-toggle" />
                    <div class="modal">
                        <div class="modal-box w-xs h-lg grid">
                            <h3 class="text-lg font-bold">Select New Channel Owner</h3>


                            <label class="my-2 btn normal-case" for="leaveChannelOwnerModal">Close</label>
                        </div>
                    </div>

                    {{ chat.selectedChannel?.name }} <br>
                    {{ chat.selectedChannel?.description }}
                </div>
                <div v-else-if="chat.selectedUser">
                    <UserAvatar :user="chat.selectedUser" />
                    {{ chat.selectedUser?.nickname }} ({{ chat.selectedUser?.username }})
                </div>
            </div>

            <div class="overflow-y-auto p-4 h-4/6 flex flex-col-reverse">
                <div v-if="chat.selectedChannelIndex != -1 || chat.selectedUserIndex != -1">
                    <ChatMessage v-for="msg of chat.messages"
                        :channelId="chat.selectedChannel?.id"
                        :message="msg"
                    />
                </div>
            </div>

            <div v-if="chat.selectedChannelIndex != -1 || chat.selectedUserIndex != -1" class="p-4 h-1/6 mt-4">
                <input type="text"
                    :placeholder="chat.isMuted (me?.id) ? 'You are muted' : 'Write something'"
                    class="input input-bordered w-4/6"
                    :disabled="chat.isMuted (me?.id)"
                    v-model="messageToSend" @keyup.enter="sendMessage ()" />
                <button
                    :disabled="chat.isMuted (me?.id)"
                    class="btn normal-case mx-4 w-1/6" @click="sendMessage ()">Send</button>
            </div>
        </div>


        <div class="w-1/4 overflow-y-auto mx-2 p-2 rounded-lg bg-base-200">
            <div class="flex bg-base-300 rounded-lg m-2" v-for="user of chat.users">
                <UserAvatar class="m-2"
                    :channelId="chat.selectedChannel?.id"
                    :user="user"
                />

                <div>{{ user.nickname }}</div>

                <iconify-icon v-if="chat.isOwner (user.id)" icon="tabler:crown" class="m-1 w-5 h-5" />
                <iconify-icon v-else-if="chat.isAdmin (user.id)" icon="eos-icons:admin-outlined" class="m-1 w-5 h-5" />
                <iconify-icon v-if="chat.isMuted (user.id)" icon="solar:muted-linear" class="m-1 w-5 h-5" />
            </div>
        </div>
    </div>
</template>
