<script setup lang="ts">

import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import axios from "axios";

import { logout } from "@/authentication";

const userStore = useUserStore ();
const { user } = storeToRefs (userStore);

</script>

<template>
    <div class="navbar bg-primary-100">
        <div class="navbar-start p-[6px] bg-secondary-100 flex-grow md:hidden">
            <div class="dropdown dropdown-right flex">
                <label tabindex="0" class="p-3 m-2 hover:bg-gray-400 hover:text-black rounded-full">
                    <iconify-icon icon="ri:menu-2-line" class="h-5 w-5" />
                </label>
                <ul tabindex="0" class="menu menu-compact dropdown-content rounded-md shadow bg-base-100">
                    <li><router-link to="/">Home</router-link></li>
                    <li><router-link to="/game">Play</router-link></li>
                    <div class="indicator">
                        <span class="indicator-item badge badge-sm badge-primary"></span>
                        <li><router-link to="/chat">Chat</router-link></li>
                    </div>
                </ul>
            </div>

            <a class="p-4 font-bold text-xl select-none">Transcendance</a>
        </div>

        <div class="navbar-start hidden md:flex">
            <a class="p-4 font-bold text-xl select-none">Transcendance</a>
        </div>

        <div class="navbar-center p-[6px] bg-secondary-200 flex-grow hidden md:flex">
            <ul class="menu menu-horizontal">
                <li><router-link to="/" class="h-[50px]">Home</router-link></li>
                <li><router-link to="/game" class="h-[50px]">Play</router-link></li>
                <div class="indicator">
                    <span class="indicator-item badge badge-sm badge-primary"></span>
                    <li><router-link to="/chat" class="h-[50px]">Chat</router-link></li>
                </div>
            </ul>
        </div>

        <div class="navbar-end" v-if="user != null">
            <div class="flex flex-col select-none m-2">
                <h3 class="text-xl">{{ user?.nickname }}</h3>
                <h3 class="text-md">{{ user?.username }}</h3>
            </div>
            <div class="dropdown dropdown-left flex">
                <label tabindex="0" class="p-3 m-2 hover:bg-gray-400 hover:text-black rounded-full">
                    <iconify-icon icon="ri:menu-2-line" class="h-5 w-5" />
                </label>
                <ul tabindex="0" class="menu menu-compact dropdown-content rounded-md shadow bg-base-100">
                    <li><router-link to="/profile">Profile</router-link></li>
                    <div class="indicator">
                        <span class="indicator-item badge badge-sm badge-primary"></span>
                        <li><router-link to="/profile/friends">Friends</router-link></li>
                    </div>
                    <li><router-link to="/login" @click="logout ()">Logout</router-link></li>
                </ul>
            </div>
            <div class="avatar" :class="!user?.avatarFile ? ' placeholder' : ''">
                <div class="select-none rounded-full overflow-hidden h-14 w-14 bg-base-300 grid">
                    <img v-if="user?.avatarFile" :src="user?.avatarFile" />
                    <span v-else class="text-xl align-text-top">{{ user?.nickname.charAt (0)}}</span>
                </div>
            </div>
        </div>
    </div>
</template>
