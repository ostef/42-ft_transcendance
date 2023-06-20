<script setup lang="ts">

import { computed, type PropType } from "vue";
import { storeToRefs } from "pinia";
import axios from "axios";

import { type User, useUserStore } from "@/stores/user";
import { fetchUserInfo } from "@/authentication";
import { fetchUsers } from "@/chat";

const { user: me } = storeToRefs (useUserStore ());


const props = defineProps ({
    user: Object as PropType<User>,
    isOnline: Boolean,
});

const receivedRequest = computed (() => me.value?.receivedFriendRequests.findIndex ((val) => val == props.user?.id) != -1);

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
    props.user.isFriend = false;
}

async function acceptFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/accept/" + props.user.id);
    props.user.isFriend = true;

    if (me.value)
    {
        const index = me.value.receivedFriendRequests.findIndex ((val) => val == props.user?.id);
        if (index != -1)
            delete me.value.receivedFriendRequests[index];
    }
}

async function declineFriendRequest ()
{
    if (!props.user)
        return;

    await axios.post ("user/friends/decline/" + props.user.id);

    if (me.value)
    {
        const index = me.value.receivedFriendRequests.findIndex ((val) => val == props.user?.id);
        if (index != -1)
            delete me.value.receivedFriendRequests[index];
    }
}

async function blockUser ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { usersToBlock: [props.user.id] });

    props.user.isFriend = false;
    props.user.isBlocked = true;
}

async function unblockUser ()
{
    if (!props.user)
        return;

    await axios.put ("user/", { usersToUnblock: [props.user.id] });

    props.user.isBlocked = false;
}

</script>

<template>

<input type="checkbox" :id="'userModal' + user?.id" class="modal-toggle" />
<div class="modal">
    <div class="modal-box w-xs h-lg grid">
        <div class="block mb-16">
            <label class="float-right btn" :for="'userModal' + user?.id">
                <iconify-icon class="w-4 h-4" icon="gg:close" />
            </label>

            <div class="flex">
                <div class="avatar" :class="(isOnline ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
                    <div class="select-none rounded-full overflow-hidden h-12 w-12 bg-base-300 grid">
                        <img v-if="user?.avatarFile" :src="user?.avatarFile" />
                        <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0)}}</span>
                    </div>
                </div>

                <div class="mx-4 select-none">
                    {{ user?.nickname }} <br>
                    {{ user?.username }}
                </div>
            </div>
        </div>

        <div v-if="!user?.isBlocked">
            <button v-if="user?.isFriend" class="m-2 btn bg-primary normal-case" @click="removeFriend ()">
                Remove Friend
            </button>

            <button v-else-if="!receivedRequest" class="m-2 btn bg-primary normal-case" @click="sendFriendRequest ()">
                Send Friend Request
            </button>

            <div v-else>
                <button class="m-2 btn bg-primary normal-case" @click="acceptFriendRequest ()">
                    Accept Friend Request
                </button>

                <button class="m-2 btn bg-primary normal-case" @click="declineFriendRequest ()">
                    Decline Friend Request
                </button>
            </div>
        </div>

        <button v-if="user?.isBlocked" class="m-2 btn normal-case" @click="unblockUser ()">
            Unblock
        </button>
        <button v-else class="m-2 btn normal-case" @click="blockUser ()">
            Block
        </button>
    </div>
</div>

</template>