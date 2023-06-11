<template>
    <div class="grid w-full place-content-center">
        <input class="input input-bordered w-full max-w-xs m-2"
            type="text" placeholder="Username" v-model="username" />
        <input class="input input-bordered w-full max-w-xs m-2"
            type="password" placeholder="Password" v-model="password" />
        <button class="btn normal-case m-2 max-w-xs" @click="submitLogin ()">Login</button>
    </div>
</template>

<script setup lang="ts">

import { ref } from "vue";
import axios from "axios";
import router from "@/router";

import { useUserStore } from "@/stores/user";
import { login } from "@/authentication";

const username = ref ("");
const password = ref ("");

async function submitLogin ()
{
    if (username.value == "" || password.value == "")
        return;

    await login (username.value, password.value);

    router.replace ("/");
}

</script>
