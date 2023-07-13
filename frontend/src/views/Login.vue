<template>
    <div class="grid w-full place-content-center">
        <input class="input input-bordered w-full max-w-xs m-2"
            type="text" placeholder="Username" v-model="username" />
        <input class="input input-bordered w-full max-w-xs m-2"
            type="password" placeholder="Password" v-model="password"
            @keyup.enter="submitLogin ()" />
        <button class="btn normal-case m-2 max-w-xs" @click="submitLogin ()">Login</button>
<!--        login using oauth-->
        <button class="btn btn-primary normal-case m-2 max-w-xs" @click="loginWith42">Login with 42</button>
    </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from "vue";
import axios from "axios";
import router from "@/router";

import { useUserStore } from "@/stores/user";
import { login, login42 } from "@/authentication";
import { useStore } from "@/store";
import { login, logout } from "@/authentication";

const username = ref ("");
const password = ref ("");

onMounted (() => {
    logout ();
});

async function loginWith42 ()
{
    await login42();
    await router.replace ("/");
}
async function submitLogin ()
{
    if (username.value.length == 0 || password.value.length == 0)
        return;

    await login (username.value, password.value);

    router.replace ("/");
}

</script>
