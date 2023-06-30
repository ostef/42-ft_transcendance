<script setup lang="ts">

import { onErrorCaptured, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { RouterView } from "vue-router";

import router from "@/router";
import { logout } from "@/authentication";
import { useStore } from "@/store";

import Header from "@/components/Header.vue";

const store = useStore ();

onErrorCaptured ((err, vm, info) =>
{
    if (isAxiosError (err))
    {
        let msg = "";
        if (err.response)
            msg = err.response.data.message;
        else
            msg = err.message;

        if (msg == "Unauthorized" || msg == "Token expired")
        {
            msg += ", redirecting to login page";
            logout ();
            router.replace ("/login");
        }

        store.pushAlert ("error", msg);

        return false;
    }
    else if (err instanceof Error)
    {
        store.pushAlert ("error", err.message);

        return false;
    }

    return true;
});

</script>

<template>
    <div class="w-screen h-screen">
        <Header />

        <RouterView />
    </div>

    <Transition>
        <div class="toast">
            <div class="alert select-none" v-for="alert of store.alerts" :class="'alert-' + alert.type">
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
