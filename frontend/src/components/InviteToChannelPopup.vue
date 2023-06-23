<script setup lang="ts">

import axios from "axios";
import { onMounted, ref } from "vue";

import type { User } from "@/stores/user";
import { useChatStore } from "@/stores/chat";

import UserSelectionList from "./UserSelectionList.vue";
import { chatSocket } from "@/chat";

const name = ref ("");
const friends = ref ([] as User[]);

const chatStore = useChatStore ();

onMounted (async () => {
    const result = await axios.get ("user/friends");

    friends.value = result.data;
});

function inviteToChannel (userId: string)
{
    if (!chatStore.selectedChannel)
        return;

    chatSocket.emit ("channelInvite", {
        channelId: chatStore.selectedChannel.id,
        userId: userId,
        message: "Hey, check out this cool channel!"
    });
}

</script>

<template>
<input type="checkbox" id="inviteToChannelModal" class="modal-toggle" />
<div class="modal">
    <div class="modal-box w-xs h-lg grid">
        <h3 class="text-lg font-bold">Invite To Channel</h3>

        <div class="h-lg">
            <UserSelectionList :users="friends" @on-select="(u) => inviteToChannel (u.id)" />
        </div>

        <label class="my-2 btn normal-case" for="inviteToChannelModal">Close</label>
    </div>
</div>
</template>

