<template>
	<h1>Login</h1>

	<div id="login">
<!--		<input type="text" name="username" v-model="input.username" placeholder="Username" />-->
<!--		<input type="password" name="password" v-model="input.password" placeholder="Password" />-->
<!--		<button type="button" @click="login()">Login</button>-->
    <button type="button" @click="login()" >Login test</button>
<!--    <a href="http://localhost:3000/auth/42">-->
<!--      <button type="button">Login with 42</button>-->
<!--    </a>-->
	</div>

</template>

<script lang="ts">

// import { ref} from "vue";

import api from "../api/api";
import store from "../plugins/store";
import router from "../plugins/router";



export default {
  name: 'Login',
  data() {
    return {
      input: {
        username: "",
        password: ""
      }
    }
  },
  methods: {
    async login(): Promise<void> {
      console.log("login button clicked");
      await store.dispatch("checkLogin", {provider: api});
      if (store.state.isLoggedIn) {
        await store.dispatch("fetchUser", {provider: api});
      }
      else {
        await store.dispatch("login", {provider: api});
        await store.dispatch("fetchUser", {provider: api});
        await store.dispatch("fetchFriends", {provider: api});
      }
      router.push({name: "myprofile"});
    }
  }
  //  mounted(): void {
  //   await
  //   store.dispatch("login", {provider: api});
  // }

}
</script>

<!--<style scoped>-->

<!--#login input,button {-->
<!--	display: block;-->
<!--	margin: 0.5em;-->
<!--}-->

<!--</style>-->
