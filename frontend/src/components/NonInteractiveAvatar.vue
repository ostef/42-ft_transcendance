<script setup lang="ts">
import type { PropType } from "vue";

import type { User } from "@/stores/user";
import { useChatStore } from "@/stores/chat";

const chatStore = useChatStore ();

const props = defineProps ({
    user: Object as PropType<User>
});

</script>

<template>
    <div class="avatar" :class="(chatStore.isOnline (user?.id) ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
        <div class="select-none rounded-full overflow-hidden h-12 w-12 bg-base-300 grid">
            <img v-if="user?.avatarFile" :src="user?.avatarFile" />
            <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0)}}</span>
        </div>
    </div>
</template>
