import "./assets/app.css";

import { createApp } from "vue";
import { createPinia, storeToRefs } from "pinia";
import { Icon } from "@iconify/vue";

import { Socket, io } from "socket.io-client";
import axios from "axios";
import VueAxios from "vue-axios";
import router from "@/router";

import App from "@/App.vue";

import { useChatStore, type Discussion, type Channel, type UserInChannel } from "./stores/chat";
import { useUserStore } from "./stores/user";

const app = createApp (App);

app.component ("iconify-icon", Icon)

app.use (createPinia ());
app.use (VueAxios, axios);
app.use (router);

axios.defaults.baseURL = "http://" + location.hostname + ":3000";
axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem ("token");

app.mount ("#app");
