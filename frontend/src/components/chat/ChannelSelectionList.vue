<script setup lang="ts">
import { computed, ref, type PropType } from "vue";

import { type User } from "@/store";

const props = defineProps ({
    channels: Object as PropType<Channel[]>
});

const emit = defineEmits(["on-select"])

const filter = ref ("");

const filteredChannels = computed (() => {
    if (!props.channels)
        return [];

    if (filter.value.length == 0)
        return props.channels;

    const result = [] as User[];

    const lowerCaseFilter = filter.value.toLowerCase ();
    for (const chan of props.channels)
    {
        if (chan.name.toLowerCase ().startsWith (lowerCaseFilter))
            result.push (chan);
    }

    return result;
});

</script>

<template>

<div class="flex flex-row">
    <div class="w-full h-full mx-2 my-4">
        <iconify-icon class="w-6 h-6 m-2 inline align-middle" icon="basil:search-outline" />
        <input type="text" v-model="filter" placeholder="Filter By Name" class="ml-2 input input-bordered w-4/6" />
    </div>
</div>

<div class="h-52 max-h-80 overflow-y-auto flex-col">
    <label v-for="chan of filteredChannels" @click="emit ('on-select', chan)"
        class="btn btn-block no-animation normal-case h-fit overflow-hidden my-1 py-2"
    >
            <div class="flex flex-col">
                <h3 class="text-lg select-none">{{ chan.name }}</h3>
                <h3 class="text-sm select-none">{{ chan.description }}</h3>
            </div>
    </label>
</div>

</template>
