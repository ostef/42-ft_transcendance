import { createStore } from "vuex";
import api from "../api/api";

export interface User {
  id: number;
  avatar: any;
  username: string;
  nickname: string;
  friends: any;
}
export default createStore({
  state: {
    isLoggedIn: false as boolean,
    user: {} as User,
    error: null as string | null,
  },
  getters: {},
  mutations: {
    setError(state, error) {
      state.error = error;
    },
    changeLoginStatus(state, status) {
      state.isLoggedIn = status;
    },
    setUser(state, user) {
      state.user = user;
      console.log("store | setUser mutation | user.nickname", user.nickname);
    },
    setFriends(state, friends) {
      state.user.friends = friends;
    },
  },
  actions: {
    async login({ commit }, { provider }) {
      const loginpopup = window.open(
        "http://localhost:3000/auth/42",
        "Login",
        "width=600,height=600"
      );
      const timer = setInterval(() => {
        if (loginpopup && loginpopup.closed) {
          clearInterval(timer);
          this.dispatch("checkLogin", { provider: api });
        }
      }, 1000);
    },
    async logout({ commit }, { provider }) {
      const response = await provider.user.logout();
      if (!response) {
        throw new Error("Logout failed");
      }
      commit("changeLoginStatus", false);
      // commit("setUser", {});
    },
    async checkLogin({ commit }, { provider }) {
      console.log("checkLogin action");
      const response = await provider.user.isAuthenticated();
      console.log("response", response);
      if (response.status === 200) {
        commit("changeLoginStatus", true);
        // commit("setUser", response.data);
      } else {
        commit("changeLoginStatus", false);
        // commit("setUser", {});
      }
    },
    async fetchUser({ commit }, { provider }) {
      console.log("store | fetchUser action");
      const response = await provider.user.get();
      console.log("response", response);
      if (response.status === 200) {
        commit("setUser", response.data);
      } else {
        commit("setError", response.data);
        console.log("error", response.data);
      }
    },
    async fetchFriends({ commit }, { provider }) {
      console.log("fetchFriends action");
      const response = await provider.friends.get();
      console.log("response", response);
      if (response.status === 200) {
        commit("setFriends", response.data);
      }
    },
    async updateNickname({ commit }, { provider, nickname }) {
      console.log("updateNickname action");
      const response = await provider.user.updateNickname({ nickname });
      if (response.status === 200) {
        commit("setUser", response.data);
      }
    },
    async updateAvatar({ commit }, { provider, avatar }) {
      console.log("updateAvatar action");
      const response = await provider.user.updateAvatar(avatar);
      if (response.status === 200) {
        commit("setUser", response.data);
      }
    },
    async addFriend({ commit }, { provider, username }) {
      const response = await provider.friends.add({ username });
      if (response.status === 200) {
        commit("setFriends", response.data);
      } else {
        commit("setError", response.data);
      }
    },
    //debug adduser
    async addUser({ commit }, { provider, username, nickname }) {
      const response = await provider.user.addUser({ username, nickname });
      if (response.status === 200) {
        commit("setUser", response.data);
      } else {
        commit("setError", response.data);
      }
    },
  },
  modules: {},
});
