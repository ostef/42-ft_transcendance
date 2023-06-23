<script setup lang="ts">

import { useChatStore } from "@/stores/chat";

import UserSelectionList from "./UserSelectionList.vue";
import { notifyChannelChange, fetchChannels, leaveChannel } from "@/chat";
import axios from "axios";
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const chatStore = useChatStore ();
const { user: me } = storeToRefs (useUserStore ());

const usersWithoutMe = computed (() => chatStore.users.filter (val => val.id != me.value?.id));

</script>

<template>
    <input type="checkbox" id="leaveChannelOwnerModal" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box w-auto h-lg grid">
            <h3 class="text-lg font-bold">Select New Channel Owner</h3>

            <div class="h-lg">
                <UserSelectionList :users="usersWithoutMe" @on-select="(u) => leaveChannel (u.id)"/>
            </div>

            <label class="btn normal-case" for="leaveChannelOwnerModal">Cancel</label>
        </div>
    </div>
</template>
