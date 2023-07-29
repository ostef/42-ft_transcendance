<script setup lang="ts">

import axios from "axios";

import { useStore } from "@/store";
import { logout } from "@/authentication";
import {ref} from "vue";

import SettingsModal from "@/components/SettingsModal.vue";

const store = useStore ();

</script>

<template>
    <div class="navbar bg-primary-100 h-20">
        <div  class="navbar-start p-[6px] bg-secondary-100 flex-grow md:hidden">
            <div class="dropdown dropdown-right flex">
                <label tabindex="0" class="p-3 m-2 hover:bg-gray-400 hover:text-black rounded-full">
                    <iconify-icon icon="ri:menu-2-line" class="h-5 w-5" />
                </label>
                <ul tabindex="0" class="relative z-50 menu menu-compact dropdown-content rounded-md shadow bg-base-100">
                    <li><router-link to="/">Home</router-link></li>
                    <li><router-link to="/game/0">Play</router-link></li>
                    <li><router-link to="/chat">Chat</router-link></li>
                </ul>
            </div>

            <a class="p-4 font-bold text-xl select-none">Transcendance</a>
        </div>

        <div class="navbar-start hidden md:flex">
            <a class="p-4 font-bold text-xl select-none">Transcendance</a>
        </div>

        <div class="navbar-center p-[6px] bg-secondary-200 flex-grow hidden md:flex">
            <ul class="menu menu-horizontal">
                <li><router-link to="/">Home</router-link></li>
                <li><router-link to="/game/0">Play</router-link></li>
                <li><router-link to="/chat">Chat</router-link></li>
            </ul>
        </div>

        <div class="navbar-end overflow-hidden" v-if="store.loggedUser != null">
            <div class="block select-none m-2">
                <h3 class="text-xl">{{ store.loggedUser.nickname }}</h3>
                <h3 class="text-md float-right">{{ store.loggedUser.username }}</h3>
            </div>
            <div class="dropdown dropdown-left flex">
                <label tabindex="0" class="p-3 m-2 hover:bg-gray-400 hover:text-black rounded-full">
                    <iconify-icon icon="ri:menu-2-line" class="h-5 w-5" />
                </label>
                <ul tabindex="0" class="relative z-50 menu menu-compact dropdown-content rounded-md shadow bg-base-100">
                    <li>
                      <label class="btn-ghost " for="setting_modal">Settings</label>
                    </li>
                    <li><router-link to="/login" @click="logout ()">Logout</router-link></li>
                </ul>
            </div>
            <div class="avatar" :class="!store.loggedUser.avatarFile ? ' placeholder' : ''">
                <div class="select-none rounded-full overflow-hidden h-14 w-14 bg-base-300 grid">
                    <img v-if="store.loggedUser.avatarFile" :src="store.loggedUser.avatarFile" />
                    <span v-else class="text-xl align-text-top">{{ store.loggedUser.nickname.charAt (0)}}</span>
                </div>
            </div>
        </div>
    </div>
  <input type="checkbox" id="setting_modal" class="modal-toggle" />
    <div  class="modal">
        <div class="modal-box w-6/12 max-w-5xl">
            <label for="setting_modal" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
                <SettingsModal />
        </div>
<!--        <label class="modal-backdrop" for="my_modal_7" >Close</label>-->
    </div>
</template>
