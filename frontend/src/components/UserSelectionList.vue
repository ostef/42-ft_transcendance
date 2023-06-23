<script setup lang="ts">
import type { User } from '@/stores/user';
import { computed, ref, type PropType } from 'vue';

import NonInteractiveAvatar from "./NonInteractiveAvatar.vue";

const props = defineProps ({
    users: Object as PropType<User[]>,
    maxSelection: Number
});

const filter = ref ("");

const filteredUsers = computed (() => {
    if (!props.users)
        return [];

    if (filter.value.length == 0)
        return props.users;

    const result = [] as User[];

    for (const u of props.users)
    {
        if (u.username.startsWith (filter.value))
            result.push (u);
    }

    return result;
});

</script>

<template>

<input type="text" v-model="filter" placeholder="Filter By Username" class="m-4 input input-bordered w-4/6" />

<div class="overflow-auto">
    <label v-for="user of filteredUsers" class="btn normal-case btn-block" @click="$emit ('on-select', user)">
        <NonInteractiveAvatar :user="user" />
        {{ user.nickname }} ({{ user.username }})
    </label>
</div>

</template>
