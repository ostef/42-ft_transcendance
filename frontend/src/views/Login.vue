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
  <div class="grid w-full place-content-center">
       <div v-if="need2fa" class="input-group">
         <input type="text" v-model="twoFactorCode" placeholder="Please enter 2fa code" class="input input-bordered" />
        <button class="btn btn-success input-group-btn" @click="submit2fa" :disabled="!twoFactorCode">Validate</button>
       </div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from "vue";
import axios from "axios";
import router from "@/router";

import {fetchUserInfo, is2FAAuthenticated, login, login2FA, login42, logout} from "@/authentication";
import { useStore } from "@/store";
import {connectChatSocket} from "@/chat";
const username = ref ("");
const password = ref ("");
const twoFactorCode = ref ("");
const need2fa = ref (false);

onMounted (() => {
    logout ();
});

async function loginWith42 ()
{
    await login42();
    await check2fa ();
    await afterLogin()
    // if (!need2fa.value)
    // await router.replace ("/");
}
async function submitLogin ()
{
    if (username.value.length == 0 || password.value.length == 0)
        return;

    await login (username.value, password.value);
    await check2fa ();
    await afterLogin()

    // if (!need2fa.value)
    //     await router.replace ("/");
}

async function submit2fa ()
{
    if (twoFactorCode.value.length == 0)
        return;

    await login2FA(twoFactorCode.value)
    need2fa.value = false;
    await afterLogin()
    // await router.replace ("/");
}

async function afterLogin ()
{
    if (need2fa.value)
        return;
    await fetchUserInfo();
    connectChatSocket()
    await router.replace ("/");
}

async function check2fa ()
{
    need2fa.value = ! await is2FAAuthenticated();
    console.log(need2fa.value);
}

</script>
