<template>
    <div class="flex flex-col space-y-10 justify-center items-center" id="container">
        <div id="information" class="flex flex-row space-x-8  items-center">
            <div class="h-24 w-24 btn  btn-circle overflow-hidden grid">
                <img v-if="store.loggedUser?.avatarFile!= undefined" :src="store.loggedUser?.avatarFile" />
            </div>
            <h2 class="text-3xl"> {{ store.loggedUser?.nickname }}</h2>
        </div>
        <div id="friendList" class="flex flex-col space-y-4">
            <h2 class="text-2xl">Friend List</h2>
            <div id="waitingList">
             <h3> Waiting</h3>
              <div class="flex flex-row space-x-4">
                <UserAvatar v-for="friend in waitingFriendList" :user="friend" />
              </div>
            </div>
            <span v-if="friendList.length == 0">You have no friends yet</span>
            <div v-else class="overflow-x-auto">
                <table class="table table-zebra table-pin-cols">
                    <tbody>
                        <tr>
                            <th>Nickname</th>
                            <th>Status</th>
                        </tr>
                        <tr v-for="friend in friendList">
                            <td class="flex flex-row space-x-4 items-center">
                                <UserAvatar :user="friend"/>
                                <span>{{ friend.nickname }}</span>
                            </td>
                            <td>
                                <span v-if="store.isOnline(friend.id)" class="text-success">Online</span>
                                <span v-else class="text-error">Offline</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      <Suspense>
        <MatchHistory :showFull="true" :user="store.loggedUser as User"/>
      </Suspense>

    </div>

</template>

<script setup lang="ts">

import {ref, toRef, watch} from "vue";
import {User, useStore} from "@/store";
import axios from "axios";
import UserAvatar from "@/components/UserAvatar.vue";
import MatchHistory from "@/components/MatchHistory.vue";


const friendList = ref ([] as User[]);
const waitingFriendList = ref ([] as User[]);
const store = useStore();


async function getFriendList ()
{
    const res = await axios.get ("http://" + window.location.hostname + ":3000/user/friends/");
    if (res.data)  friendList.value = res.data;
}

async function getWaitingFriendList ()
{
    waitingFriendList.value = [];
    for (const userId of store.loggedUser?.receivedFriendRequests ?? [])
    {
        const res = await axios.get ("http://" + window.location.hostname + ":3000/user/profile/" + userId);
        if (res.data)  waitingFriendList.value.push(res.data);
    }

}

getFriendList ();
getWaitingFriendList()

watch(store.loggedUser?.receivedFriendRequests, async () => {
    await getFriendList ();
    await getWaitingFriendList()
});



</script>
