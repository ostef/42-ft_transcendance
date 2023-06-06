<template>
    <div class="grid w-full place-content-center">
        <input class="input input-bordered w-full max-w-xs m-2"
            type="text" placeholder="Username" v-model="username" />
        <input class="input input-bordered w-full max-w-xs m-2"
            type="password" placeholder="Password" v-model="password" />
        <button class="btn normal-case m-2 max-w-xs" @click="login ()">Login</button>
    </div>
</template>

<script setup lang="ts">

import { ref } from "vue";
import axios from "axios";
import router from "@/router";

const username = ref ("");
const password = ref ("");

async function login ()
{
    if (username.value == "" || password.value == "")
        return;

    try
    {
        const res = await axios.post ("auth/login", { username: username.value, password: password.value });

        const token: string = res.data.access_token;
        localStorage.setItem ("token", token);

        router.replace ("/");
    }
    catch (err: any)
    {
        if (err.response)
            console.log ("Could not log in: ", err.response.data);
        else
            console.log ("Could not log in");
    }
}

</script>
