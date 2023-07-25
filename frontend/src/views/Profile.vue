<template>
    <div class="flex flex-col space-y-10 justify-center items-center" id="container">
        <div id="information" class="flex flex-row space-x-8  items-center">
            <div class="h-24 w-24 btn  btn-circle overflow-hidden grid">
                <img v-if="userStore.loggedUser?.avatarFile!= undefined" :src="userStore.loggedUser?.avatarFile" />
            </div>
            <h2 class="text-3xl">  {{ userStore.loggedUser?.nickname }}</h2>
        </div>
        <div id="friendList" class="flex flex-col space-y-4">
            <h2 class="text-2xl">Friend List</h2>
            <span v-if="friendList.length == 0">You have no friends yet</span>
            <div v-else class="overflow-x-auto">
                <table class="table table-zebra table-pin-cols">
                    <thread>
                        <tr>
                            <th>Nickname</th>
                            <th>Status</th>
                        </tr>
                    </thread>
                    <tbody>
                        <tr v-for="friend in friendList">
                            <td class="flex flex-row space-x-4 items-center">
                                <img  :src="friend.avatarFile" />
                            </td>
                            <td>{{ friend.nickname }}</td>
                            <td>
                                WIP
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div id="matchHistory" class="flex flex-col space-y-4 w-fit">
            <h2 class="text-2xl">Match History</h2>
            <span v-if="matchHistory.length == 0">You have no match history yet</span>
            <div v-else class="overflow-x-auto">
                <table class="table table-zebra table-pin-cols">
                    <thread>
                        <tr>
                            <th>Adversaire</th>
                            <th>Resultat</th>
                            <th>Score perso</th>
                            <th>Score adversaire</th>
                        </tr>
                    </thread>
                    <tbody>
                        <tr v-for="match in matchHistory">
                            <td class="flex flex-row space-x-4 items-center">
                                <UserAvatar :user-id="match.opponentId" :nickname="match.opponentNickname" :picture="match.opponentAvatarFile"/>
                                <span>{{ match.opponentNickname }}</span>
                            </td>
                            <td>
                                <span v-if="match.winner == match.opponentNickname">Defaite</span>
                                <span v-else>Victoire</span>
                            </td>
                            <td>{{ match.playerScore }}</td>
                            <td>{{ match.opponentScore}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">

import { ref } from "vue";
import { useStore } from "@/store";
import axios from "axios";
import UserAvatar from "@/components/UserAvatar.vue";

interface MatchHistory
{
    opponentId: number;
    opponentNickname: string;
    opponentAvatarFile: string;
    playerScore: number;
    opponentScore: number;
    winner: string;
}

const userStore = useStore();
const matchHistory = ref ([] as MatchHistory[]);
const friendList = ref ([]);

async function getMatchHistory ()
{
    // TODO: get match history from id user
    const id = userStore.loggedUser?.id;

    const res = await axios.get ("http://localhost:3000/game/matchHistory/" + id, {
        params: {
            id: id
        }});

    if (res.data)  matchHistory.value = res.data;
}

async function getFriendList ()
{
    const res = await axios.get ("http://localhost:3000/user/friends/");
    if (res.data)  friendList.value = res.data;
}

getMatchHistory ();
getFriendList ();

</script>

<style scoped>

</style>