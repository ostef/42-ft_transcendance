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
      <input type="text" v-model="updateNickname" placeholder="Nickname">
      <button type="submit">Update</button>
    </form>
  </div>
    <div>
    <p>Update Avatar</p>
    <v-img :src="avatar" width="100" height="100"></v-img>
    <input type="file" accept="image/*" @change="updateAvatar" formenctype="multipart/form-data">
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
</div>



</template>

<script lang="ts">



import store from "../plugins/store";
import api from "../api/api";
import {User} from "../plugins/store";

import defaultAvatarUrl from "../assets/default_avatar.png";

import router from "../plugins/router";

import {onMounted} from "vue";

// async function getProfile() {
//
// await this.$store.login()
// }


export default {
  name: "Setting",
  async beforeMount() {
    this.user = store.state.user;
    if (this.user.avatar == null)
      this.user.avatar = defaultAvatarUrl;
    if (!store.state.user)
      console.log("Setting | user not logged in, this is not supposed to happen");
    else
      console.log("Setting | user logged in, this is supposed to happen");
    // await this.$store.dispatch("login", {provider: this.$api});
  },
  data() {
    return {
      user: null as User | null,
      updateNickname: "",
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
      //TODO: check if nickname already exists
      await store.dispatch("updateNickname", {provider: api, nickname: this.updateNickname});
    },
    async updateAvatar(event: any): Promise<void> {
      console.log("update avatar button clicked");
      const file = event.target.files[0];
      const fd = new FormData();
      fd.append("avatar", file);
      await store.dispatch("updateAvatar", {provider: api, avatar: fd});
    }

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
    avatar(): any {
      return store.state.user.avatar;
    }
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