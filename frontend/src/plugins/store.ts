
import { createStore } from "vuex";
import api from "../api/api";
import { Socket } from 'socket.io-client';
import Vue from 'vue';
import { IChannel, IMessage, IUser } from "../types";

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
    chat: {
			socket: null,
			channels: <IChannel[]> [
				{ id: 0, name: "La conv des gauchos ☭", description: "Abaleta" },
				{ id: 1, name: "Transcendance 🖲️", description: "Dernier projet du tronc commun de 42" },
				{ id: 3, name: "Manif 28 Mars Lyon 🔥", description: "CA VA PETER!!!" },
				{ id: 4, name: "Anniv du boss 🥳", description: "Le premier week-end d'avril, c'est la teuf avant la revolution!" },
			],
			loadedMessages: <IMessage[]> [
				{ senderId: 1, content: "C'est quoi ca?" },
				{ senderId: 0, content: "FEUR ZINZIN!" },
				{ senderId: 1, content: "OH TIE FADA TIE ME PARLE PAS COMME CA HEING!!!" },
				{ senderId: 0, content: "MACRROOOOOON NOUS FAIT LA GUERREUH\nET SAAAAA POLICE AUSSI\n*police aussi!!*\nNOUS OOOOON RESTEUH DETEREUH\nPOUR BLOOOO-QUER LE PAYS\n*bloquer l'pays!!*" },
				{ senderId: 1, content: "Ceci est un long message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message" },
			],
			usersInChannel: <IUser[]> [
				{ id: 0, username: "soumanso", profilePictureURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hammer_and_sickle.svg/1024px-Hammer_and_sickle.svg.png" },
				{ id: 1, username: "glemoine", profilePictureURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hammer_and_sickle.svg/1024px-Hammer_and_sickle.svg.png" },
				{ id: 2, username: "rmonacho", profilePictureURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Hammer_and_sickle.svg/1024px-Hammer_and_sickle.svg.png" },
			],
		},
  },
  
	getters: {
		getChatSocket: (state) => state.chat.socket,
		getLoadedMessages: (state) => state.chat.loadedMessages,
		getChannels: (state) => state.chat.channels,
		getUsersInChannel: (state) => state.chat.usersInChannel,
	},
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
    setChatSocket(state, socket) { state.chat.socket = socket; },
		appendMessage(state, msg) { state.chat.loadedMessages.push (msg); },
		setLoadedMessages(state, newList) { state.chat.loadedMessages = newList; },
		setUsersInChannel(state, newList) { state.chat.usersInChannel = newList; },
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
