<template>
	<div id="nav">
		<router-link v-if="authenticated" to="/login" @click.native="logout()" replace>Logout</router-link>
	</div>
  <div id="error">
    <p>ERROR</p>
    <p  ref="error" v-if="error">{{ error }}</p>
  </div>
	<router-view @authenticated="setAuthenticated" />

</template>

<script lang="ts">

import store from "./plugins/store";
import api from "./api/api";

export default {
	name: 'App',
	data() {
		return {
      error: store.state.error,
			authenticated: false,
		}
	},
	created(): void {
    console.log("App created")
		store.dispatch("checkLogin", {provider: api});
    console.log("Login status: " + store.state.isLoggedIn);
    if (store.state.isLoggedIn) {
      store.dispatch("fetchUser", {provider: api});
    }
	},
	methods: {
		setAuthenticated (status: boolean): void {
			this.authenticated = status;
		},

		logout (): void {
			this.authenticated = false;
		}
	},
  computed: {
    error(): any {
      return store.state.error;
    }
  },
  watch: {
    error: function (newError, oldError) {
     //update error p tag
      this.$refs.error.innerText = newError;
    }
  }
}

</script>

<style scoped>
</style>
