<script setup lang="ts">

import { useStore } from "@/store";
import { leaveChannel, deleteChannel } from "@/chat";

import InviteToChannelPopup from "@/components/chat/InviteToChannelPopup.vue";
import ConfirmPopup from "@/components/ConfirmPopup.vue";
import LeaveChannelOwnerPopup from "@/components/chat/LeaveChannelOwnerPopup.vue";
import ChannelSettingsPopup from "@/components/chat/ChannelSettingsPopup.vue";

const store = useStore ();

</script>

<template>
    <div class="hidden lg:inline">
        <label v-if="store.selectedChannel && store.isOwner (store.loggedUser?.id)" for="confirmDeleteChannelModal"
            class="btn normal-case float-right m-2 bg-red-500 hover:bg-red-600"
        >
            <iconify-icon class="w-4 h-4 m-2 text-black text-opacity-60" icon="material-symbols:delete-outline" />
            <div class="text-black text-opacity-60">
                Delete
            </div>
        </label>

        <label v-if="store.selectedChannel" class="btn normal-case float-right m-2" :for="store.isOwner (store.loggedUser?.id) ? 'leaveChannelOwnerModal' : 'confirmLeaveChannelModal'">
            <iconify-icon class="w-4 h-4 m-2" icon="pepicons-pop:leave" />
            <div>
                Leave
            </div>
        </label>

        <label v-if="store.selectedChannel?.isPrivate" for="inviteToChannelModal"
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
                <li v-if="store.selectedChannel?.isPrivate"><label for="inviteToChannelModal"
                    class="normal-case"
                >
                    <iconify-icon class="w-4 h-4 m-2" icon="mdi:invite" />
                    <div>
                        Invite
                    </div>
                </label></li>
                <li v-if="store.selectedChannel"><label class="normal-case" :for="store.isOwner (store.loggedUser?.id) ? 'leaveChannelOwnerModal' : 'confirmLeaveChannelModal'">
                    <iconify-icon class="w-4 h-4 m-2" icon="pepicons-pop:leave" />
                    <div>
                        Leave
                    </div>
                </label></li>
                <li v-if="store.selectedChannel && store.isOwner (store.loggedUser?.id)"><label for="confirmDeleteChannelModal"
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

    <div class="flex">
        <label v-if="store.selectedChannel?.ownerId == store.loggedUser?.id" for="channelSettingsModal"
            class="ml-2 my-2 w-fit h-fit p-3 hover:bg-gray-400 hover:text-black rounded-full">
            <iconify-icon class="w-5 h-5" icon="material-symbols:settings-outline"/>
        </label>
        <div class="ml-4 my-2 flex flex-col overflow-hidden">
            <h3 class="text-lg select-none truncate">{{ store.selectedChannel?.name }}</h3>
            <h3 class="text-sm select-none truncate">{{ store.selectedChannel?.description }}</h3>
        </div>
    </div>
    <ChannelSettingsPopup />
</template>
