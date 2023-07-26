<script setup lang="ts">

import axios from "axios";
import { storeToRefs } from "pinia";
import { computed, type PropType } from "vue";

import { useStore, type User } from "@/store";
import { selectPrivConv, notifyChannelChange, notifyUserKickOrBan, chatSocket } from "@/chat";

import UserPopup from "./UserPopup.vue";
import router from "@/router";

// @Todo: handle buttons when we are not on the chat page

const store = useStore ();
const { channelsSelected, privateConvs, selectedUserIndex } = storeToRefs (useStore ());

const props = defineProps ({
    channelId: String,
    user: Object as PropType<User>,
    dropdownClass: String,
});

const clientIsAdmin = computed (() => {
    if (!props.channelId)
        return false;

    const channel = store.channels.find ((val) => val.id == props.channelId);

    return store.isAdmin (store.loggedUser?.id, channel);
});

const clientIsOwner = computed (() => {
    if (!props.channelId)
        return false;

    const channel = store.channels.find ((val) => val.id == props.channelId);

    return store.isOwner (store.loggedUser?.id, channel);
});

const isInChannel = computed (() => {
    // @Cleanup: we use the users list to check if the user is in the channel,
    // but it may be possible for this list to not be the same as the one of channelId
    return props.channelId != undefined && store.users.find (val => val.id == props.user?.id) != null;
});

const isMuted = computed (() => {
    if (!props.channelId)
        return false;

    const channel = store.channels.find ((val) => val.id == props.channelId);

    return store.isMuted (props.user?.id, channel);
});

const isAdmin = computed (() => {
    if (!props.channelId)
        return false;

    const channel = store.channels.find ((val) => val.id == props.channelId);

    return store.isAdmin (props.user?.id, channel);
});

const isOnline = computed (() => {
    if (!props.user)
        return false;

    return store.isOnline (props.user?.id);
});

const isInGame = computed (() => {
    if (!props.user)
        return false;

    return store.isInGame (props.user?.id);
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

async function inviteUserToPlay ()
{
    if (!props.user)
        return;

    const gameId = (await axios.post ("game")).data;
    chatSocket.emit ("gameInvite", {
        userId: props.user.id,
        gameId: gameId,
        message: "Hey, come play a game with me!"
    });

    store.pushAlert ("success", "Invited " + props.user.username + " to a game of Pong");

    router.replace ("game/c" + gameId);
}

</script>

<template>
    <div class="tooltip dropdown flex" :class="dropdownClass ?? ''" :data-tip="user?.username" >
        <label tabindex="0" class="avatar" :class="(isOnline ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
            <div class="h-12 w-12 btn normal-case btn-circle overflow-hidden grid"
                :class="isInGame ? 'ring ring-primary ring-offset-base-100 ring-offset-2' : ''"
            >
                <img v-if="user?.avatarFile" :src="user?.avatarFile" />
                <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0) }}</span>
            </div>
        </label>
        <ul tabindex="0" class="relative z-50 menu menu-compact dropdown-content w-40 m-2 shadow rounded-md bg-base-300">
            <li v-if="store.loggedUser?.id != user?.id">
                <a @click="goToPrivateConv ()">Send Message</a>
            </li>

            <li v-if="store.loggedUser?.id != user?.id">
                <a @click="inviteUserToPlay ()">Invite To Play</a>
            </li>

            <li v-if="isInChannel && store.loggedUser?.id != user?.id && clientIsOwner && !isAdmin">
                <a @click="adminUser ()">Make Admin</a>
            </li>

            <li v-if="isInChannel && store.loggedUser?.id != user?.id && clientIsOwner && isAdmin">
                <a @click="unadminUser ()">Unadmin</a>
            </li>

            <li v-if="isInChannel && store.loggedUser?.id != user?.id && clientIsAdmin">
                <a v-if="!isMuted" @click="muteUser ()">Mute User</a>
                <a v-else @click="unmuteUser ()">Unmute User</a>
            </li>

            <li v-if="isInChannel && store.loggedUser?.id != user?.id && clientIsAdmin">
                <a @click="kickUser ()">Kick User</a>
            </li>

            <!-- You can ban someone that has left the channel -->
            <li v-if="channelId && store.loggedUser?.id != user?.id && clientIsAdmin">
                <a @click="banUser ()">Ban User</a>
            </li>

            <li v-if="user?.id != store.loggedUser?.id">
                <label :for="'userModal' + user?.id">
                    User Profile
                </label>
            </li>

            <li v-if="user?.id == store.loggedUser?.id">
                <label>My Profile</label>
            </li>

        </ul>
    </div>

    <UserPopup :user="user" :isOnline="isOnline" />
</template>
