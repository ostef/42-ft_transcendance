<template>

<div id="channels">
</div>

<div id="chat-messages">
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
		}
	},

	created ()
	{
		this.socket = io ("http://" + window.location.hostname + ":3000/chat");

		this.socket.on ("onMessage", (data: any) => {
			console.log (data);
		});

		this.socket.on ("onConnection", (data: any) => {
			console.log (data);
		});
	},

	methods: {
		sendMessage (): void
		{
			this.socket.emit ("newMessage", this.inputMessage);
			this.inputMessage = "";
		}
	}
}

</script>

<style scoped>

</style>
