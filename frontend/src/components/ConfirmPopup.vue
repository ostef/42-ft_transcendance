<script setup lang="ts">

const props = defineProps ({
    id: String,
    title: String,
    noText: String,
    yesText: String,
});

</script>

<template>
    <input type="checkbox" :id="id" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box w-auto grid h-lg">
            <h3 class="text-lg font-bold">{{ title }}</h3>
            <div class="mt-8 w-full">
                <label class="float-left btn normal-case m-2" :for="id" @click="$emit ('on-no')">{{ noText }}</label>
                <label class="float-right btn normal-case m-2" :for="id" @click="$emit ('on-yes')">{{ yesText }}</label>
            </div>
        </div>
    </div>
</template>
