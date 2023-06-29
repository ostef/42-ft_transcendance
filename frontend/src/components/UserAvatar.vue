<script setup lang="ts">

import axios from "axios";
import { storeToRefs } from "pinia";
import { computed, type PropType } from "vue";

import { useUserStore, type User } from "@/stores/user";
import { useChatStore } from "@/stores/chat";
import { selectPrivConv, notifyChannelChange, notifyUserKickOrBan } from "@/chat";

import UserPopup from "./UserPopup.vue";

const chatStore = useChatStore ();
const { user: me } = storeToRefs (useUserStore ());
const { channelsSelected, privateConvs, selectedUserIndex } = storeToRefs (useChatStore ());

const props = defineProps ({
    channelId: String,
    user: Object as PropType<User>,
    dropdownClass: String,
});

const clientIsAdmin = computed (() => {
    if (!props.channelId)
        return false;

    const channel = chatStore.channels.find ((val) => val.id == props.channelId);

    return chatStore.isAdmin (me.value?.id, channel);
});

const clientIsOwner = computed (() => {
    if (!props.channelId)
        return false;

    const channel = chatStore.channels.find ((val) => val.id == props.channelId);

    return chatStore.isOwner (me.value?.id, channel);
});

const isMuted = computed (() => {
    if (!props.channelId)
        return false;

    const channel = chatStore.channels.find ((val) => val.id == props.channelId);

    return chatStore.isMuted (props.user?.id, channel);
});

const isAdmin = computed (() => {
    if (!props.channelId)
        return false;

    const channel = chatStore.channels.find ((val) => val.id == props.channelId);

    return chatStore.isAdmin (props.user?.id, channel);
});

const isOnline = computed (() => {
    if (!props.user)
        return false;

    return chatStore.isOnline (props.user?.id);
});

async function muteUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToMute: [props.user.id] });
    notifyChannelChange (props.channelId);
}

async function unmuteUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToUnmute: [props.user.id] });
    notifyChannelChange (props.channelId);
}

async function kickUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToKick: [props.user.id] });
    notifyUserKickOrBan (props.channelId, props.user.id, true, "");
    notifyChannelChange (props.channelId);
}

async function banUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToBan: [props.user.id] });
    notifyUserKickOrBan (props.channelId, props.user.id, false, "");
    notifyChannelChange (props.channelId);
}

async function adminUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToAdmin: [props.user.id] });
    notifyChannelChange (props.channelId);
}

async function unadminUser ()
{
    if (!props.channelId || !props.user)
        return;

    await axios.put ("channels/" + props.channelId, {usersToUnadmin: [props.user.id] });
    notifyChannelChange (props.channelId);
}

async function goToPrivateConv ()
{
    if (!props.user)
        return;

    let index = privateConvs.value.findIndex ((val) => val.id == props.user?.id);
    if (index == -1)
    {
        privateConvs.value.push (props.user);
        index = privateConvs.value.length - 1;
    }

    selectedUserIndex.value = index;
    channelsSelected.value = false;

    await selectPrivConv (props.user.id);
}

</script>

<template>
    <div class="tooltip dropdown flex" :class="dropdownClass ?? ''" :data-tip="user?.username" >
        <label tabindex="0" class="avatar" :class="(isOnline ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
            <div class="h-12 w-12 btn btn-circle overflow-hidden grid">
                <img v-if="user?.avatarFile" :src="user?.avatarFile" />
                <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0) }}</span>
            </div>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content w-40 m-2 shadow rounded-md bg-base-300">
            <li v-if="me?.id != user?.id">
                <a @click="goToPrivateConv ()">Send Message</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && clientIsOwner && !isAdmin">
                <a @click="adminUser ()">Make Admin</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && clientIsOwner && isAdmin">
                <a @click="unadminUser ()">Unadmin</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && clientIsAdmin">
                <a v-if="!isMuted" @click="muteUser ()">Mute User</a>
                <a v-else @click="unmuteUser ()">Unmute User</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && clientIsAdmin">
                <a @click="kickUser ()">Kick User</a>
            </li>

            <li v-if="channelId && me?.id != user?.id && clientIsAdmin">
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
