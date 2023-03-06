import { createStore } from "vuex";
import api from "../api/api";

export interface user {
  id: number;
  username: string;
  nickname: string;
  friends: any;
}
export default createStore({
  state: {
    isLoggedIn: false as boolean,
    user: {} as user,
    error: null as string,
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
      console.log("fetchUser action");
      const response = await provider.user.get();
      console.log("response", response);
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
  },
  modules: {},
});
