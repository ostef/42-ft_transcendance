<script setup lang="ts">

import { onErrorCaptured, ref } from "vue";

import { isAxiosError } from "axios";
import Header from "./components/Header.vue";

import { RouterView } from "vue-router";

const lastError = ref ("");
const lastErrorTimeout = ref (0);

onErrorCaptured ((err, vm, info) =>
{
    if (isAxiosError (err))
    {
        if (err.response)
            lastError.value = err.response.data;
        else
            lastError.value = err.message;

        clearTimeout (lastErrorTimeout.value);
        lastErrorTimeout.value = setTimeout (() => lastError.value = "", 5000);

        return false;
    }
});

</script>

<template>
    <div class="h-screen">
        <Header />

        <RouterView />
    </div>

    <Transition>
        <div class="toast" v-if="lastError != ''">
            <div class="alert alert-error">
                <iconify-icon icon="material-symbols:error-outline" class="h-5 w-5" />
                <span>{{ lastError }}</span>
            </div>
        </div>
    </Transition>
</template>

// Style for transition of error alert
<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
