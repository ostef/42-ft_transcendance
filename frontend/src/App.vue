<script setup lang="ts">

import { onErrorCaptured, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { RouterView } from "vue-router";

import router from "@/router";
import { logout } from "@/authentication";
import { useStore, type AlertType } from "@/store";
import { catchError } from "@/main";

import Header from "@/components/Header.vue";

const store = useStore ();

function getAlertClassName (type: AlertType)
{
    // For some reason I can't do 'alert-' + type
    switch (type)
    {
    case "error":
        return "alert-error";
    case "info":
        return "alert-info";
    case "success":
        return "alert-success";
    case "warning":
        return "alert-warning";
    }

    return "";
}

onErrorCaptured ((err) => catchError (err));

</script>

<template>
    <div class="w-screen h-screen">
        <Header />

        <RouterView />
    </div>

    <Transition>
        <div class="toast">
            <div class="alert select-none" v-for="alert of store.alerts"
                :class="getAlertClassName (alert.type)">
                <iconify-icon icon="material-symbols:error-outline" class="h-5 w-5" />
                {{ alert.message }}
            </div>
        </div>
    </Transition>
</template>

// Style for transition of alerts
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

<style>
.h-full-without-header
{
    height: calc(100% - 5rem);
}

</style>
