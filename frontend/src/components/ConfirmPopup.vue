<script setup lang="ts">

const props = defineProps ({
    id: String,
    title: String,
    noText: {type: String, default: "No"},
    yesText:  {type: String, default: "Yes"},
});

const emit = defineEmits (["on-no", "on-yes"]);

</script>

<template>
    <input type="checkbox" :id="id" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box w-auto flex flex-col">
            <h3 class="text-lg font-bold select-none">{{ title }}</h3>
            <div class="mt-8 w-full flex flex-row">
                <label :for="id" @click="emit ('on-no')"
                    class="float-left btn normal-case m-2 bg-primary hover:bg-primary-focus text-primary-content"
                >{{ noText }}</label>
                <label :for="id" @click="emit ('on-yes')"
                    class="float-right btn normal-case m-2"
                >{{ yesText }}</label>
            </div>
        </div>
    </div>
</template>
