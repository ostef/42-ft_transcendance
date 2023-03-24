import * as Vue from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
// import * as VueCookies from "vue-cookies";
import VueCookies from "vue-cookies";

import * as Vuex from "vuex";
import "./style.css";

import App from "./App.vue";
import router from "./plugins/router";
import store from "./plugins/store";

import axios from "axios";
import VueAxios from "vue-axios";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";

//import style
import "vue3-toastify/dist/index.css";

import api from "./api/api";
import Api from "./api/api";
import { inject, provide } from "vue";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  components,
  directives,
});

const app = Vue.createApp(App);
// app.use((Vuex);
app.use(router);

app.use(store);
app.use(vuetify);
app.use(VueCookies);
app.use(VueAxios, axios);
app.use(Vue3Toastify, {
  autoClose: 3000,
} as ToastContainerOptions);
axios.defaults.baseURL = "http://" + location.hostname + ":3000";
//axios.defaults.baseURL = 'http://jsonplaceholder.typicode.com';
// axios.defaults.headers.common["Authorization"] = W;
// "Bearer " + localStorage.getItem("token");
// app.config.globalProperties.$api = new Api();
// app.provide("api", app.config.globalProperties.$api);

// const $cookies = inject<VueCookies>("$cookies");
// provide("$cookies", $cookies);
// app.config.globalProperties.$cookies = $cookies;

app.mount("#app");
