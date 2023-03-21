import { Socket } from 'socket.io-client';
import Vue from 'vue';
import Vuex from 'vuex';
import { IChannel, IMessage, IUser } from "../types";

export default new Vuex.Store ({
	state: {
		chat: {
			socket: null,
			currentChannelId: -1,
			loadedMessages: <IMessage[]> [
				{ senderId: 1, content: "C'est quoi ca?" },
				{ senderId: 0, content: "FEUR ZINZIN!" },
				{ senderId: 1, content: "OH TIE FADA TIE ME PARLE PAS COMME CA HEING!!!" },
				{ senderId: 0, content: "MACRROOOOOON NOUS FAIT LA GUERREUH\nET SAAAAA POLICE AUSSI\n*police aussi!!*\nNOUS OOOOON RESTEUH DETEREUH\nPOUR BLOOOO-QUER LE PAYS\n*bloquer l'pays!!*" },
				{ senderId: 1, content: "Ceci est un long message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message" },
				{ senderId: 1, content: "Ceci est un long message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message message" },
			],
			channels: <IChannel[]> [],
			usersInChannel: <IUser[]> [],
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
		getCurrentChannelId: (state) => state.chat.currentChannelId,
		getUsersInChannel: (state) => state.chat.usersInChannel,
		getChannels: (state) => state.chat.channels,
	},

	mutations: {
		setChatSocket(state, socket) { state.chat.socket = socket; },
		appendMessage(state, msg) { state.chat.loadedMessages.push (msg); },
		appendMessageHistory(state, msgs: any[]) { state.chat.loadedMessages = msgs.concat (state.chat.loadedMessages); }
	},
});
