<template>
<h1>Debug</h1>
<!--  add user-->
<form @submit.prevent="addUser">
  <input type="text" v-model="username" placeholder="username">
  <input type="text" v-model="nickname" placeholder="nickname">
  <input type="text" v-model="password" placeholder="password">
  <input type="submit" value="add user">
</form>
</template>

<script lang="ts">
import store from "../plugins/store";
import api from "../api/api";

export default {
  name: "Debug.vue",
  data() {
    return {
      username: "",
      nickname: "",
      password: "",
    }
  },
  methods: {
    async addUser(): Promise<void> {
      console.log("add user button clicked");
      await store.dispatch("addUser", {provider: api, username: this.username, nickname: this.nickname, password: this.password});
    },
  },
}
</script>

<style scoped>

</style>