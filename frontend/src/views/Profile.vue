<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import axios from "axios";

import {type User, useStore} from "@/store";
import router from "@/router";

import { type GameMatch } from "@/store";

import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";
import GameStats from "@/components/user/GameStats.vue";
import FriendList from "@/components/user/FriendList.vue";
import MatchHistory from "@/components/user/MatchHistory.vue";

const store = useStore();

const showFriends = ref (true);

const user = ref (null as User | null);
const matchHistory = ref ([] as GameMatch[]);

async function fetchUserAndMatchHistory ()
{
    const userId = router.currentRoute.value.params.id ?? store.loggedUser?.id;
    if (!userId)
        return null;

    user.value = (await axios.get ("user/profile/" + userId)).data;
    matchHistory.value = (await axios.get ("game/match-history/" + userId)).data;
}

watch (router.currentRoute, async () => { await fetchUserAndMatchHistory (); });

onMounted (async () => { await fetchUserAndMatchHistory (); });

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

        <div class="h-friends overflow-y-auto p-2">
            <!-- <FriendList v-if="showFriends" /> -->
            <div v-if="!showFriends || user?.id != store.loggedUser?.id" class="flex flex-col justify-center">
                <GameStats class="m-4" :userId="user?.id ?? undefined" :matchHistory="matchHistory" />
                <MatchHistory class="my-4" :userId="user?.id ?? undefined" :matchHistory="matchHistory" />
            </div>
            <div v-else-if="showFriends">
                <FriendList :userId="user?.id ?? undefined" />
            </div>
        </div>
    </div>

</div>

    <!-- <div class="w-96 flex flex-row">
        <div class="p-4">
            <NonInteractiveAvatar class="h-24 w-24" :user="store.loggedUser ?? undefined" />
        </div>

        <label for="friendsModal" class="btn normal-case">Friend Requests</label>
        <label for="friendsModal" class="btn normal-case">Friends</label>
        <div class="grid w-96 bg-base-300">
            <div class="w-full h-20 my-2 bg-secondary">
            </div>
            <div class="w-full h-20 my-2 bg-secondary">
            </div>
        </div>
    </div> -->


<!--
<FriendsPopup />
<div class="flex flex-col w-screen items-center justify-center">
    <div class="flex flex-col w-screen justify-center items-center sm:flex-row">
        <div class="p-4">
            <NonInteractiveAvatar class="h-24 w-24" :user="store.loggedUser ?? undefined" />
        </div>
        <div class="mx-10 grid text-center">
            <div v-if="receivedFriendRequests.length > 0">
                <h3 class="text-xl select-none">Received Friend Requests</h3>
                <h3 v-if="receivedFriendRequests.length == 0" class="text-md select-none">You have no friend request yet</h3>
                <div v-else class="overflow-y-visible overflow-x-auto w-full h-fit">
                    <div class="contents">
                        <div class="mx-1" v-for="friend in receivedFriendRequests">
                            <UserAvatar :user="friend"/>
                        </div>
                    </div>
                </div>
            </div>
            <h2 class="text-xl select-none">Friends</h2>
            <h3 v-if="friendList.length == 0" class="text-md select-none">You have no friend yet</h3>
            <div v-else class="w-full overflow-y-visible overflow-x-auto h-fit">
                <div class="flex flex-row p-4">
                    <div v-for="friend in friendList" class="mx-1">
                        <UserAvatar :user="friend"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <MatchHistory :showFull="true" :user="store.loggedUser ?? undefined" />
</div> -->
</template>

<style scoped>

.h-friends
{
    height: calc(100% - 5rem - 12rem - 2.5rem);
}

</style>
