<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import axios from "axios";
import { storeToRefs } from "pinia";

import {type User, useStore} from "@/store";
import router from "@/router";

import { type GameMatch } from "@/store";

import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";
import GameStats from "@/components/user/GameStats.vue";
import FriendList from "@/components/user/FriendList.vue";
import MatchHistory from "@/components/user/MatchHistory.vue";

const store = useStore();

const showFriends = ref (false);

const user = ref (null as User | null);
const matchHistory = ref ([] as GameMatch[]);
const friends = ref ([] as User[]);
const friendRequests = ref ([] as User[]);

async function fetchData ()
{
    const userId = router.currentRoute.value.params.id ?? store.loggedUser?.id;
    if (!userId)
        return null;

    user.value = (await axios.get ("user/profile/" + userId)).data;
    matchHistory.value = (await axios.get ("game/match-history/" + userId)).data;

    friends.value.length = 0;
    friendRequests.value.length = 0;
    if (userId === store.loggedUser?.id)
    {
        friends.value = (await axios.get ("user/friends")).data;

        for (const req of store.loggedUser.receivedFriendRequests)
        {
            const u = (await axios.get ("user/profile/" + req)).data;
            friendRequests.value.push (u);
        }
    }
}

watch (router.currentRoute, async () => { await fetchData (); });

const { loggedUser } = storeToRefs (store);

watch (loggedUser, async () => { await fetchData (); });

onMounted (async () => { await fetchData (); });

</script>

<template>

<div class="flex justify-center h-full-without-header overflow-hidden">
    <div class="w-3/4">
        <div class="w-full flex flex-col h-48 justify-center">
            <div class="mx-10">
                <NonInteractiveAvatar class="min-w-24 min-h-24 h-24 w-24" :user="user ?? undefined" />
                <div class="inline-grid mx-6 justify-center select-none">
                    <h3 class="text-2xl truncate">{{ user?.nickname }} </h3>
                    <h3 class="text-lg truncate">{{ user?.username }} </h3>
                </div>
            </div>
        </div>

        <div class="navbar h-10 bg-base-200">
            <ul class="menu menu-horizontal">
                <li v-if="user?.id == store.loggedUser?.id">
                    <label class="text-lg" @click="showFriends=true">Friends</label>
                </li>
                <li v-else>
                    <label class="text-lg btn-disabled" :class="user?.id != store.loggedUser?.id ? 'btn-disabled' : ''">
                        <iconify-icon v-if="user?.id != store.loggedUser?.id" class="w-6 h-6" icon="fontisto:locked" />
                        Friends
                    </label>
                </li>
                <li><label class="text-lg" @click="showFriends=false">Game Stats</label></li>
            </ul>
        </div>

        <div class="h-friends overflow-x-hidden overflow-y-auto p-2">
            <div v-if="!showFriends || user?.id != store.loggedUser?.id" class="flex flex-col justify-center">
                <GameStats class="m-4" :userId="user?.id ?? undefined" :matchHistory="matchHistory" />
                <MatchHistory class="my-4" :userId="user?.id ?? undefined" :matchHistory="matchHistory" />
            </div>
            <div v-else-if="showFriends">
                <FriendList :friendRequests="friendRequests" :friends="friends" />
            </div>
        </div>
    </div>

</div>

</template>

<style scoped>

.h-friends
{
    height: calc(100% - 5rem - 12rem - 2.5rem);
}

</style>
