<script setup lang="ts">
import type { User } from '@/stores/user';
import { computed, ref, type PropType } from 'vue';

import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";

const props = defineProps ({
    users: Object as PropType<User[]>
});

const emit = defineEmits(["on-select"])

const filter = ref ("");

const filteredUsers = computed (() => {
    if (!props.users)
        return [];

    if (filter.value.length == 0)
        return props.users;

    const result = [] as User[];

    const lowerCaseFilter = filter.value.toLowerCase ();
    for (const u of props.users)
    {
        if (u.username.toLowerCase ().startsWith (lowerCaseFilter)
        || u.nickname.toLowerCase ().startsWith (lowerCaseFilter))
            result.push (u);
    }

    return result;
});

</script>

<template>

<div class="flex flex-row">
    <div class="w-full h-full mx-2 my-4">
        <iconify-icon class="w-6 h-6 m-2 inline align-middle" icon="basil:search-outline" />
        <input type="text" v-model="filter" placeholder="Filter By Nickname Or Username" class="ml-2 input input-bordered w-4/6" />
    </div>
</div>

<div class="h-52 max-h-80 overflow-y-auto flex-col">
    <label v-for="user of filteredUsers" @click="emit ('on-select', user)"
        class="btn btn-block no-animation normal-case h-fit overflow-hidden my-1 py-2"
    >
            <div class="mr-4 -ml-10">
                <NonInteractiveAvatar :user="user" />
            </div>
            <div class="flex flex-col">
                <h3 class="text-lg select-none">{{ user.nickname }}</h3>
                <h3 class="text-sm select-none">{{ user.username }}</h3>
            </div>
    </label>
</div>

</template>
