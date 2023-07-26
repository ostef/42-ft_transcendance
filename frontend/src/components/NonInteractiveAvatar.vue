<script setup lang="ts">
import type { PropType } from "vue";

import { useStore, type User } from "@/store";

const store = useStore ();

const props = defineProps ({
    user: Object as PropType<User>
});

</script>

<template>
    <div class="avatar  h-12 w-12" :class="(store.isOnline (user?.id) ? 'online' : 'offline') + (!user?.avatarFile ? ' placeholder' : '')">
        <div class="select-none rounded-full overflow-hidden bg-base-300 grid"
            :class="store.isInGame (user?.id) ? 'ring ring-primary ring-offset-base-100 ring-offset-2' : ''"
        >
            <img v-if="user?.avatarFile" :src="user?.avatarFile" />
            <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0)}}</span>
        </div>
    </div>
</template>
