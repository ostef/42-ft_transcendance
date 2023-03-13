<template>
	<div id="nav">
		<router-link to="/">Home</router-link>
    <router-link to="/login">Login</router-link>
    <router-link to="/profile">Profile</router-link>
    <router-link to="/register">Register</router-link>
    <router-link to="/logout">Logout</router-link>
	</div>
  <div id="error">
    <p>ERROR</p>
    <p  ref="error" v-if="error">{{ error }}</p>
  </div>
	<router-view />
<!--  <router-view @authenticated="setAuthenticated" />-->

</template>

<script lang="ts">

import store from "./plugins/store";
import api from "./api/api";
import {toast} from "vue3-toastify";
import 'vue3-toastify/dist/index.css';

export default {
	name: 'App',
	data() {
		// return {
    //   error: store.state.error,
		// 	authenticated: false,
		// }
	},
	async created(): void {
    console.log("App created")
		store.dispatch("checkLogin", {provider: api});
    console.log("Login status: " + store.state.isLoggedIn);
    if (store.state.isLoggedIn) {
      await store.dispatch("fetchUser", {provider: api});
      await store.dispatch("fetchFriends", {provider: api});
    }
	},
	methods: {
		// setAuthenticated (status: boolean): void {
		// 	this.authenticated = status;
		// },


	},
  computed: {
    error(): any {
      return store.state.error;
    }
  },
  watch: {
    error: function (newError) {
      toast(newError, {type: "error"})
    }
  }
}

</script>

<style scoped>
</style>
