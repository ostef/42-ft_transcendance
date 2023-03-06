<template>

<div id="channels">
</div>

<div id="chat-main">
	<div id="chat-messages">
		<div v-for="msg in loadedMessages">[{{ msg.date }}] {{ msg.from }} sent: {{ msg.content }}</div>
	</div>

	<form>
		<input type="text" name="input-message" v-model="inputMessage" placeholder="Write something" />
		<button type="button" @click="sendMessage()">Send</button>
		<button type="button" @click="loadMessageHistory()">Load History</button>
	</form>
</div>

<div id="channel-info">
</div>

</template>

<script lang="ts">

import { io } from 'socket.io-client';

export default {
	data () {
		return {
			inputMessage: ""
		}
	},

	computed: {
		socket: {
			get (): any {
				return this.$store.getters.getChatSocket;
			},

			set (socket: unknown) {
				this.$store.commit ("setChatSocket", socket);
			}
		},

		loadedMessages: {
			get (): any {
				return this.$store.getters.getLoadedMessages;
			},
		},

		oldestLoadedMessage: {
			get (): any {
				return this.$store.getters.getOldestMessage;
			},
		},
	},

	created ()
	{
		this.socket = io ("http://" + window.location.hostname + ":3000/chat");
		this.socket.emit ("getMessageHistory", this.oldestLoadedMessage);

		this.socket.on ("onMessage", (data: any) => {
			console.log ("onMessage: " + data);

			this.$store.commit ("appendMessage", {from: data.from, date: data.date, content: data.content});
		});

		this.socket.on ("onConnection", (data: any) => {
			console.log ("onConnection: " + data);

			// Ignore for now, because this breaks message history
			//if (data.id != this.socket.id)
			//	this.$store.commit ("appendMessage", {from: "Server", date: new Date (), content: data.id + " joined the chat room"});
		});

		this.socket.on ("messageHistory", (data: any[]) => {
			console.log ("messageHistory: " + data);
			if (data != null)
				this.$store.commit ("appendMessageHistory", data);
		});

	},

	methods: {
		sendMessage (): void
		{
			if (this.inputMessage.length > 0)
			{
				this.socket.emit ("newMessage", { date: new Date (), content: this.inputMessage });
				this.inputMessage = "";
			}
		},

		loadMessageHistory (): void
		{
			this.socket.emit ("getMessageHistory", this.oldestLoadedMessage);
		}
	}
}

</script>

<style scoped>

</style>
