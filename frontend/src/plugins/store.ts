import { Socket } from 'socket.io-client';
import Vue from 'vue';
import Vuex from 'vuex';

export default new Vuex.Store ({
	state: {
		chat: {
			socket: null,
		},
	},

	getters: {
		getChatSocket: (state) => state.chat.socket,
	},

	mutations: {
		setChatSocket(state, socket) { state.chat.socket = socket; }
	},
});
