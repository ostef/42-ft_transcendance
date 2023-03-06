<template>

<div id="channels">
</div>

<div id="chat-main">
	<div id="chat-messages">
		<div v-for="msg in loadedMessages">{{ msg.from }} sent: {{ msg.content }}</div>
	</div>

	<form>
		<input type="text" name="input-message" v-model="inputMessage" placeholder="Write something" />
		<button type="button" @click="sendMessage()">Send</button>
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
	},

	created ()
	{
		this.socket = io ("http://" + window.location.hostname + ":3000/chat");

		this.socket.on ("onMessage", (data: any) => {
			console.log ("onMessage: " + data);

			if (data.from == this.socket.id)
				this.$store.commit ("appendMessage", {from: "You", content: data.content});
			else
				this.$store.commit ("appendMessage", {from: data.from, content: data.content});
		});

		this.socket.on ("onConnection", (data: any) => {
			console.log ("onConnection: " + data);

			if (data.id != this.socket.id)
				this.$store.commit ("appendMessage", {from: "Server", content: data.id + " joined the chat room"});
		});

	},

	methods: {
		sendMessage (): void
		{
			if (this.inputMessage.length > 0)
			{
				this.socket.emit ("newMessage", this.inputMessage);
				this.inputMessage = "";
			}
		}
	}
}

</script>

<style scoped>

</style>
