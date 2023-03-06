import { Socket } from 'socket.io-client';
import Vue from 'vue';
import Vuex from 'vuex';

export default new Vuex.Store ({
	state: {
		chat: {
			socket: null,
			loadedMessages: [],
		},
	},

	getters: {
		getChatSocket: (state) => state.chat.socket,
		getLoadedMessages: (state) => state.chat.loadedMessages,
		getOldestMessage: (state) => {
			if (state.chat.loadedMessages.length > 0)
				return state.chat.loadedMessages[0];
			return null;
		},
	},

	mutations: {
		setChatSocket(state, socket) { state.chat.socket = socket; },
		appendMessage(state, msg) { state.chat.loadedMessages.push (msg); },
		appendMessageHistory(state, msgs: any[]) { state.chat.loadedMessages = msgs.concat (state.chat.loadedMessages); }
	},
});
