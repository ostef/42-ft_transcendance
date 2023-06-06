import "./assets/app.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { Icon } from "@iconify/vue";

import axios from "axios";
import VueAxios from "vue-axios";
import router from "./router";

import App from "./App.vue";

const app = createApp (App);

app.use (VueAxios, axios);
app.use (createPinia ());
app.use (router);

app.component ("iconify-icon", Icon)

axios.defaults.baseURL = "http://" + location.hostname + ":3000";
axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem ("token");


app.mount ("#app");
