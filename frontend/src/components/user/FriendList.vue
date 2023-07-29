<script setup lang="ts">

import type { PropType } from 'vue';

import type { User } from '@/store';

import UserAvatar from "@/components/UserAvatar.vue";

// @Todo: we can store these props in the store, and update them in real
// time, but for now I'm keeping the straightforward thing. The downside
// is that we don't update the friendRequests and friends lists when we
// add/remove a friend or accept/decline a request

const props = defineProps ({
    friendRequests: Object as PropType<User[]>,
    friends: Object as PropType<User[]>
});

</script>

<template>

<h3 class="text-xl font-semibold select-none py-5">Received Friend Requests</h3>
<div class="mx-4">
    <h3 class="text-md italic select-none" v-if="friendRequests?.length == 0">You have received no friend requests at the moment</h3>
    <div class="flex flex-wrap" v-else>
        <div v-for="req in friendRequests" class="m-2">
            <UserAvatar :user="req" />
        </div>
    </div>
</div>

<h3 class="text-xl font-semibold select-none py-5">Friends</h3>
<div class="mx-4">
    <h3 class="text-md italic select-none" v-if="friends?.length == 0">You have no friend at the moment</h3>
    <div class="flex flex-wrap" v-else>
        <div v-for="friend in friends" class="m-2">
            <UserAvatar :user="friend" />
        </div>
    </div>
</div>

</template>
