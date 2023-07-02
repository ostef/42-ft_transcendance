<script setup lang="ts">

import axios from "axios";
import { storeToRefs } from "pinia";

import { useUserStore } from "@/stores/user";

const { user } = storeToRefs (useUserStore ());

defineProps ({
    userId: String,
    username: String,
    nickname: String,
    picture: String,
    online: Boolean,
    left: Boolean,
    isBlocked: Boolean,
    isFriend: Boolean,
});

async function sendFriendRequest (id: string | undefined)
{
    if (id == undefined)
        return;

    await axios.post ("user/friends/add/" + id);
}

async function removeFriend (id: string | undefined)
{
    if (id == undefined)
        return;

    await axios.put ("user/", { friendsToRemove: [id] });
}

async function blockUser (id: string | undefined)
{
    if (id == undefined)
        return;

    await axios.put ("user/", { usersToBlock: [id] });
}

async function unblockUser (id: string | undefined)
{
    if (id == undefined)
        return;

    await axios.put ("user/", { usersToUnblock: [id] });
}

async function checkStatus ()
{
    console.log ("checkStatus");
    if (this.userId == undefined)
        return;

    const res = await axios.get ("user/friends/" + userId);
    (res.data) ? isFriend.value = res.data : isFriend.value = false;
}

</script>

<template>
    <div class="tooltip dropdown flex" :class="left ? 'dropdown-left' : 'dropdown-right'" :data-tip="username"  @click="checkStatus">
        <label tabindex="0" class="avatar"
            :class="(online ? 'online' : 'offline') + (picture == null ? ' placeholder' : '')">
            <div class="h-12 w-12 btn btn-circle overflow-hidden grid">
                <img v-if="picture != null && picture != undefined" :src="picture" />
                <span v-else class="text-xl align-text-top">{{ nickname?.charAt (0) }}</span>
            </div>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content w-40 m-2 shadow rounded bg-base-300">
            <li v-if="user?.id != userId">
                <a v-if="!isFriend" @click="sendFriendRequest (userId)">Add Friend</a>
                <a v-else @click="removeFriend (userId)">Remove Friend</a>
            </li>
            <li v-if="user?.id != userId">
                <a>Send Message</a>
            </li>
            <li v-if="user?.id != userId">
                <a :class="isBlocked ? 'btn-disabled' : ''">Invite To Play</a>
            </li>
            <li><a>See User Profile</a></li>
            <li v-if="user?.id != userId">
                <a v-if="!isBlocked" class="bg-accent hover:bg-accent-focus" @click="blockUser (userId)">Block User</a>
                <a v-else class="bg-accent hover:bg-accent-focus" @click="unblockUser (userId)">Unblock User</a>
            </li>
        </ul>
    </div>
</template>
