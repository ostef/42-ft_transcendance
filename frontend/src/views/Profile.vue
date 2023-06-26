<template>
    <div class="flex flex-col space-y-10 justify-center items-center" id="container">
        <div id="information" class="flex flex-row space-x-8  items-center">
            <div class="h-24 w-24 btn  btn-circle overflow-hidden grid">
                <img v-if="userStore.user.avatarFile!= undefined" :src="userStore.user.avatarFile" />
            </div>
            <h2 class="text-3xl">  {{ userStore.user.nickname }}</h2>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

</script>

<style scoped>

</style>