<template>
<h1>Profile</h1>
<!--  <a href="http://localhost:3000/auth/42">-->
<!--    <Button type="button">Login with 42</Button>-->
<!--  </a>-->

<div id="profile">
    <p>Username: {{ user.username }}</p>
    <p>Nickname: {{ user.nickname }}</p>
    <v-img :src="user.avatar" width="100" height="100"></v-img>
  </div>

  <div id=friends>
    <h2>Friends</h2>
    <p v-if="!user.friends">No friends yet</p>
    <ul>
      <li v-for="friend in user.friends" :key="friend.id" >
        <router-link :to="{ name: 'profile', params: { id: friend.id } }">{{ friend.username }}</router-link>
      </li>
    </ul>
  </div>



</template>

<script lang="ts">



import store from "../plugins/store";
import api from "../api/api";
import {User} from "../plugins/store";


import router from "../plugins/router";

// async function getProfile() {
//
// await this.$store.login()
// }
 function fetchUser(): User {
  if (!router.currentRoute.value.params.username || router.currentRoute.value.params.username == store.state.user.username) {
    return store.state.user;
  }
  else {
    const user =  api.user.get(router.currentRoute.value.params.username);
    return user;
  }
}

export default {
  name: "Profile",

  data() {
    return {
      user: {} as User,
      friendUsername: "",
      // nickname: store.state.user.nickname
    }
  },
  created() {
    console.log("Profile | onMounted");
    this.user =  fetchUser();
    console.log("Profile | username: ", this.user.username);
  },
  methods: {
  },
}
//   computed: {
//     // friends(): any {
//     //   return this.$store.state.user.friends;
//     // },
//
//     username(): string {
//        this.getUser.then((user) => {
//          return user.username;
//        });
//
//     },
//     nickname(): string {
//       return store.state.user.nickname;
//     },
//     friends(): any {
//       return store.state.user.friends;
//     },
//   }
//
// }

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