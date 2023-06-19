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

    await axios.put ("channels/" + props.channelId, {usersToUnmute: [props.user.id] });
    await fetchChannelInfo (props.channelId as string);
}

async function kickUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToKick: [props.user.id] });
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
            <li v-if="me?.id != user?.id">
                <a>Send Message</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin && !isAdmin">
                <a @click="adminUser ()">Make Admin</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin">
                <a v-if="!isMuted" @click="muteUser ()">Mute User</a>
                <a v-else @click="unmuteUser ()">Unmute User</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin">
                <a @click="kickUser ()">Kick User</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && iAmAdmin">
                <a @click="banUser ()">Ban User</a>
            </li>

            <li v-if="user?.id != me?.id">
                <label :for="'userModal' + user?.id">
                    User Profile
                </label>
            </li>

        </ul>
    </div>

    <UserPopup :user="user" :isOnline="isOnline" />
</template>
