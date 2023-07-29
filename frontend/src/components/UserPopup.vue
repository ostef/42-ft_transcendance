<script setup lang="ts">

import { computed, type PropType } from "vue";
import { storeToRefs} from "pinia";
import axios from "axios";

import { type User, useStore } from "@/store";
import { notifyFriendshipChange } from "@/chat";

import NonInteractiveAvatar from "./NonInteractiveAvatar.vue";

const store = useStore ();

const props = defineProps ({
    user: Object as PropType<User>,
    isOnline: Boolean,
});

const receivedRequest = computed (() => store.loggedUser?.receivedFriendRequests.findIndex ((val) => val == props.user?.id) != -1);

async function sendFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/add/" + props.user.id);
    notifyFriendshipChange (props.user.id, "friend-request");
    store.pushAlert ("success", "Sent a friend request to " + props.user.username);
}

async function removeFriend ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { friendsToRemove: [props.user.id] });
    props.user.isFriend = false;
    notifyFriendshipChange (props.user.id, "friend-removed");
}

async function acceptFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/accept/" + props.user.id);
    props.user.isFriend = true;
    notifyFriendshipChange (props.user.id, "friend-accepted");

    const {loggedUser} = storeToRefs (store);
    if (loggedUser.value)
    {
        const index = loggedUser.value.receivedFriendRequests.findIndex ((val) => val == props.user?.id);
        if (index != -1)
            loggedUser.value.receivedFriendRequests.splice (index, 1);
    }
}

async function declineFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/decline/" + props.user.id);
    notifyFriendshipChange (props.user.id, "friend-declined");

    const {loggedUser} = storeToRefs (store);
    if (loggedUser.value)
    {
        const index = loggedUser.value.receivedFriendRequests.findIndex ((val) => val == props.user?.id);
        if (index != -1)
            loggedUser.value.receivedFriendRequests.splice (index, 1);
    }
}

async function blockUser ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { usersToBlock: [props.user.id] });
    notifyFriendshipChange (props.user.id, "blocked");

    props.user.isFriend = false;
    props.user.isBlocked = true;
}

async function unblockUser ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { usersToUnblock: [props.user.id] });
    notifyFriendshipChange (props.user.id, "unblocked");

    props.user.isBlocked = false;
}

</script>

<template>

<input type="checkbox" :id="'userModal' + user?.id" class="modal-toggle" />
<div class="modal">
    <div class="modal-box w-xs h-lg grid">
        <div class="block mb-16">
            <label class="float-right btn rounded-full" :for="'userModal' + user?.id">
                <iconify-icon class="w-4 h-4" icon="gg:close" />
            </label>

            <div class="flex">
                <NonInteractiveAvatar class="w-12 h-12 min-w-12 min-h-12" :user="user" />

                <div class="flex flex-col mx-4 select-none">
                    <h3 class="text-lg">{{ user?.nickname }}</h3>
                    <h3 class="text-sm">{{ user?.username }}</h3>
                </div>
            </div>

            <h3 v-if="user?.hasBlockedYou" class="text-sm italic select-none m-4">
                This user has blocked you
            </h3>
        </div>
        <!-- <GameStats :userId="user?.id ?? undefined" /> -->

        <div v-if="!user?.isBlocked && !user?.hasBlockedYou">
            <button v-if="user?.isFriend" class="m-2 btn bg-primary normal-case" @click="removeFriend ()">
                Remove Friend
            </button>

            <button v-else-if="!receivedRequest" class="m-2 btn bg-primary normal-case" @click="sendFriendRequest ()">
                Send Friend Request
            </button>

            <div v-else>
                <button class="m-2 btn-success btn normal-case" @click="acceptFriendRequest ()">
                    Accept Friend Request
                </button>

                <button class="m-2 btn btn-error normal-case" @click="declineFriendRequest ()">
                    Decline Friend Request
                </button>
            </div>
        </div>

        <button v-if="user?.isBlocked" class="m-2 btn btn-error normal-case" @click="unblockUser ()">
            Unblock
        </button>
        <button v-else class="m-2 btn normal-case" @click="blockUser ()">
            Block
        </button>

        <router-link :to="'/profile/' + user?.id" class="m-2 btn normal-case">
            Go To Profile Page
        </router-link>
    </div>
</div>

</template>