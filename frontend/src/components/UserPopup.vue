<script setup lang="ts">

import { type PropType } from "vue";

import { type User } from "@/stores/user";

defineProps ({
    user: Object as PropType<User>,
    channelId: String,
    isOnline: Boolean,
    isAdmin: Boolean,
    isMuted: Boolean,
    isBlocked: Boolean,
});

</script>

<template>

<input type="checkbox" :id="'userModal' + user?.id" class="modal-toggle" />
<div class="modal">
    <div class="modal-box w-xs h-lg grid">
        <div class="avatar h-12 w-12 btn btn-circle overflow-hidden grid"
            :class="(isOnline ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
            <img v-if="user?.avatarFile" :src="user?.avatarFile" />
            <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0) }}</span>
        </div>

        <label class="my-2 btn normal-case" :for="'userModal' + user?.id">Close</label>
    </div>
</div>

</template>