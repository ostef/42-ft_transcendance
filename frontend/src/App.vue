<template>
  <v-app>
    <v-main>
      <v-app-bar id="nav">
        <v-app-bar-title>Ft tramscemdance</v-app-bar-title>>
        <router-link to="/">
          <v-btn icon>
            <v-icon :icon="mdiHome"></v-icon>
          </v-btn>
        </router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/profile">Profile</router-link>
        <router-link to="/settings">
          <v-btn icon>
            <v-icon :icon="mdiAccountSettings"></v-icon>
          </v-btn>
        </router-link>
        <router-link to="/chat">
          <v-btn icon>
            <v-icon :icon="mdiChat()"></v-icon>
          </v-btn>
        </router-link>
        <router-link to="/register">Register</router-link>
        <router-link to="/debug">Debug</router-link>
        <router-link to="/logout">Logout</router-link>
      </v-app-bar>
      <div id="error">
        <p>ERROR</p>
        <p ref="error" v-if="error">{{ error }}</p>
      </div>
      <router-view />
    </v-main>
    <!--  <router-view @authenticated="setAuthenticated" />-->
  </v-app>
  <!--	<v-app-bar id="nav">-->
  <!--		<router-link to="/">Home</router-link>-->
  <!--    <router-link to="/login">Login</router-link>-->
  <!--    <router-link to="/profile">Profile</router-link>-->
  <!--    <router-link to="/register">Register</router-link>-->
  <!--    <router-link to="/logout">Logout</router-link>-->
  <!--	</v-app-bar>-->
  <!--  <div id="error">-->
  <!--    <p>ERROR</p>-->
  <!--    <p  ref="error" v-if="error">{{ error }}</p>-->
  <!--  </div>-->
  <!--	<router-view />-->
  <!--  <router-view @authenticated="setAuthenticated" />-->
</template>

<script lang="ts">
import store from "./plugins/store";
import api from "./api/api";
import { toast } from "vue3-toastify";

//import icons
import { mdiHome, mdiAccountSettings, mdiChat } from "@mdi/js";

// import 'vue3-toastify/dist/index.css';

export default {
  name: "App",
  data() {
    return {
      mdiHome: mdiHome,
      mdiAccountSettings: mdiAccountSettings,
    };
  },
  async created(): Promise<void> {
    console.log("App created");
    await store.dispatch("checkLogin", { provider: api });
    console.log("Login status: " + store.state.isLoggedIn);
    if (store.state.isLoggedIn) {
      await store.dispatch("fetchUser", { provider: api });
      await store.dispatch("fetchFriends", { provider: api });
    }
  },
  methods: {
    mdiChat() {
      return mdiChat;
    },
    // setAuthenticated (status: boolean): void {
    // 	this.authenticated = status;
    // },
  },
  computed: {
    error(): any {
      return store.state.error;
    },
  },
  watch: {
    error: function (newError: any) {
      toast(newError, { type: "error" });
    },
  },
};
</script>

<style scoped></style>
