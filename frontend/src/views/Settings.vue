
<script lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";

const { user } = storeToRefs (useUserStore ());
</script>


<template>
    <div class="h-12 w-12 btn btn-circle overflow-hidden grid">
        <img v-if="user.picture != null && user.picture != undefined" :src="picture" />
        <span v-else class="text-xl align-text-top">{{ nickname?.charAt (0) }}</span>
    </div>
</template>


<style scoped>

</style>