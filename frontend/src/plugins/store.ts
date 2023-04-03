import { Socket } from 'socket.io-client';
import Vue from 'vue';
import Vuex from 'vuex';
import { IChannel, IMessage, IUser } from "../types";

export default new Vuex.Store ({
	state: {
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
		setChatSocket(state, socket) { state.chat.socket = socket; },
		appendMessage(state, msg) { state.chat.loadedMessages.push (msg); },
		setLoadedMessages(state, newList) { state.chat.loadedMessages = newList; },
		setUsersInChannel(state, newList) { state.chat.usersInChannel = newList; },
	},
});
