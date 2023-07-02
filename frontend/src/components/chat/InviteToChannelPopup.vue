<script setup lang="ts">

import axios from "axios";
import { onMounted, ref } from "vue";

import { useStore, type User } from "@/store";

import UserSelectionList from "./UserSelectionList.vue";
import { chatSocket } from "@/chat";

const friends = ref ([] as User[]);

const store = useStore ();

async function fetchFriends ()
{
    const result = await axios.get ("user/friends");

    friends.value.length = 0;
    for (const friend of result.data)
    {
        if (!store.users.find (val => val.id == friend.id))
            friends.value.push (friend);
    }
};

function inviteToChannel (user: User)
{
    if (!store.selectedChannel)
        return;

    chatSocket.emit ("channelInvite", {
        channelId: store.selectedChannel.id,
        userId: user.id,
        message: "Hey, check out this cool channel!"
    });

    store.pushAlert ("success", "Invited " + user.username + " to '" + store.selectedChannel.name + "'");
}

</script>

<template>
<input type="checkbox" id="inviteToChannelModal" class="modal-toggle" @change="fetchFriends ()" />
<div class="modal">
    <div class="modal-box w-xs h-lg grid">
        <div class="block">
            <label class="float-right btn rounded-full" for="inviteToChannelModal">
                <iconify-icon class="w-4 h-4" icon="gg:close" />
            </label>

            <h3 class="text-lg font-bold select-none">Invite To Channel</h3>
            <h3 class="text-sm select-none">Invitations expire after 48 hours</h3>
        </div>

        <div class="h-lg">
            <UserSelectionList :users="friends" @on-select="(u) => inviteToChannel (u)" />
        </div>
    </div>
</div>
</template>

