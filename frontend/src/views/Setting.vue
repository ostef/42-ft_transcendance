<template>
<h1>Setting</h1>
<!--  <a href="http://localhost:3000/auth/42">-->
<!--    <Button type="button">Login with 42</Button>-->
<!--  </a>-->

<div id="setting">
    <p>Username: {{ username }}</p>
    <p>Nickname: {{ nickname }}</p>
  //if logged and my profile
  <div>
    <form @submit.prevent="updateProfile">
      <p>Update Nickname</p>
      <input type="text" v-model="nickname" placeholder="Nickname">
      <button type="submit">Update</button>
    </form>
  </div>
  </div>
  <div id=friends>
    <h2>Friends</h2>
    <p v-if="!friends">No friends yet</p>
    <ul>
      <li v-for="friend in friends" :key="friend.id" >
        <router-link :to="{ name: 'profile', params: { id: friend.id } }">{{ friend.username }}</router-link>
      </li>
    </ul>
   <form @submit.prevent="addFriend">
     <input type="text" v-model="friendUsername" placeholder="Username">
     <button type="submit">Add Friend</button>
    </form>
  </div>



</template>

<script lang="ts">



import store from "../plugins/store";
import api from "../api/api";
import {User} from "../plugins/store";

import router from "../plugins/router";

import {onMounted} from "vue";

// async function getProfile() {
//
// await this.$store.login()
// }


export default {
  name: "Setting",
  async beforeMount() {
    if (!store.state.user)
      console.log("Setting | user not logged in, this is not supposed to happen");
    else
      console.log("Setting | user logged in, this is supposed to happen");
    // await this.$store.dispatch("login", {provider: this.$api});
  },
  data() {
    return {
      user: null as User | null,
      friendUsername: "",
      // nickname: store.state.user.nickname
    }
  },
  methods: {

    async addFriend(): Promise<void> {
      console.log("add friend button clicked");
      await store.dispatch("addFriend", {provider: api, username: this.friendUsername});
    },
    async updateProfile(): Promise<void> {
      console.log("update profile button clicked");
      await store.dispatch("updateNickname", {provider: api, nickname: this.nickname});
    },

  },
  computed: {
    // friends(): any {
    //   return this.$store.state.user.friends;
    // },

    username(): string {
      return store.state.user.username;
    },
    nickname(): string {
      return store.state.user.nickname;
    },
    friends(): any {
      return store.state.user.friends;
    },
  }

}



 // methods: {
 //    logout(): void {
 //       //TODO: call api logout
 //    }
 //
 //    getFriends(): void {
 //
 //   }

</script>

<style scoped>

</style>