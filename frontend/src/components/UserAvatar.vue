<script setup lang="ts">

import axios from "axios";
import { storeToRefs } from "pinia";
import { type PropType } from "vue";

import { useUserStore, type User } from "@/stores/user";
import { fetchUsers, fetchChannelInfo } from "@/chat";
import { fetchUserInfo } from "@/authentication";

import UserPopup from "./UserPopup.vue";

const { user: me } = storeToRefs (useUserStore ());

const props = defineProps ({
    channelId: String,
    user: Object as PropType<User>,
    isOnline: Boolean,
    left: Boolean,
    isMuted: Boolean,
    isAdmin: Boolean,
    iAmAdmin: Boolean,
});

async function sendFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/add/" + props.user.id);
}

async function removeFriend ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { friendsToRemove: [props.user.id] });

    // @Todo: if we are not in a channel, we don't have a way to update
    // the user info
    if (props.channelId)
        await fetchUsers (props.channelId);
}

async function acceptFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/accept/" + props.user.id);

    if (props.channelId)
    {
        await fetchUserInfo ();
        await fetchUsers (props.channelId);
    }
}

async function declineFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/decline/" + props.user.id);

    if (props.channelId)
    {
        await fetchUserInfo ();
        await fetchUsers (props.channelId);
    }
}

async function blockUser ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { usersToBlock: [props.user.id] });

    if (props.channelId)
        await fetchUsers (props.channelId);
}

async function unblockUser ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { usersToUnblock: [props.user.id] });

    if (props.channelId)
        await fetchUsers (props.channelId);
}

async function muteUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToMute: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

async function unmuteUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToUnute: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

async function banUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToBan: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

async function unbanUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToUnban: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

async function adminUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToAdmin: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

async function unadminUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToUnadmin: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

</script>

<template>
    <div class="tooltip dropdown flex" :class="left ? 'dropdown-left' : 'dropdown-right'" :data-tip="user?.username" >
        <label tabindex="0" class="avatar" :class="(isOnline ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
            <div class="h-12 w-12 btn btn-circle overflow-hidden grid">
                <img v-if="user?.avatarFile" :src="user?.avatarFile" />
                <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0) }}</span>
            </div>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content w-40 m-2 shadow rounded bg-base-300">
            <li v-if="me?.id != user?.id && me?.receivedFriendRequests.findIndex ((val) => val == user?.id) != -1">
                <a @click="acceptFriendRequest ()">Accept Friend</a>
                <a @click="declineFriendRequest ()">Decline Friend</a>
            </li>
            <li v-else-if="me?.id != user?.id">
                <a v-if="!user?.isFriend" @click="sendFriendRequest ()">Send Friend Request</a>
                <a v-else @click="removeFriend ()">Remove Friend</a>
            </li>

            <li>
                <label :for="'userModal' + user?.id">
                    More...
                </label>
            </li>

            <li v-if="me?.id != user?.id">
                <a>Send Message</a>
            </li>

            <li v-if="me?.id != user?.id">
                <a :class="user?.isBlocked ? 'btn-disabled' : ''">Invite To Play</a>
            </li>

            <li><a>See User Profile</a></li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin">
                <a v-if="!isMuted">Mute User</a>
                <a v-else>Unmute User</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin && !isAdmin">
                <a>Make Admin</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin">
                <a>Kick User</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin">
                <a>Ban User</a>
            </li>
            <li v-if="me?.id != user?.id">
                <a v-if="!user?.isBlocked" class="bg-accent hover:bg-accent-focus" @click="blockUser ()">Block User</a>
                <a v-else class="bg-accent hover:bg-accent-focus" @click="unblockUser ()">Unblock User</a>
            </li>
        </ul>
    </div>

    <UserPopup :user?.id="user?.id" />
</template>
