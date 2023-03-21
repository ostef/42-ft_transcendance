<template>

<div id="channels">
	<h2>Channels</h2>

</div>

<div id="chat-main">
	<h2>Messages</h2>
	<div id="chat-messages">
		<div v-for="msg in loadedMessages" :class="msg.senderId == 0 ? 'message mine' : 'message theirs'">
			<div class="message-sender" />
			<div class="message-text">
				{{ msg.content }}
			</div>
		</div>
	</div>

	<form id="chat-input">
		<input type="text" name="input-message" v-model="inputMessage" placeholder="Write something" />
		<button type="button" @click="">Send</button>
	</form>
</div>

<div id="channel-users">
	<h2>Users</h2>
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

		currentChannelId: {
			get (): any {
				return this.$store.getters.getCurrentChannelId;
			},
		},

		channels: {
			get (): any {
				return this.$store.getters.getChannels;
			},
		},
	},

	created ()
	{
		this.socket = io ("http://" + window.location.hostname + ":3000/chat");

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
	}
}

</script>

<style scoped>

*
{
	box-sizing: border-box;
}

#channels
{
	position: absolute;
	left: 0;
	right: 80%;
	top: 0;
	bottom: 0;
	background: blue;
	border-radius: 15px;
	margin: 5px;
	overflow: hidden;
}

#chat-main
{
	position: absolute;
	left: 20%;
	right: 20%;
	top: 0;
	bottom: 0;
	background: green;
	border-radius: 15px;
	margin: 5px;
	display: grid;
	overflow: hidden;
}

#channel-users
{
	overflow: hidden;
	position: absolute;
	left: 80%;
	right: 0;
	top: 0;
	bottom: 0;
	background: red;
	border-radius: 15px;
	margin: 5px;
}

#chat-messages
{
	background: rgba(209, 124, 209, 0.933);
	overflow: scroll;
	display: grid;
	padding: 10px;
}

.message
{
	margin: 10px;
	/* background: white; */
}

.message-sender
{
	background: lime;
	border-radius: 50%;
	width: 50px;
	height: 50px;
	float: left;
}

.message-text
{
	background: tomato;
	border-radius: 20px;
	margin-left: 10px;
	margin-right: 10px;
	padding: 12px;
	float: left;
	max-width: 40%;
	overflow: hidden;
	white-space: pre-line;
}

.message.mine .message-sender
{
	float: right;
}

.message.mine .message-text
{
	background: blue;
	float: right;
}

#chat-input
{
	background: white;
	padding: 20px;
}

#chat-input input
{
	border: 1px solid #555;
	width: 60%;
	padding: 10px;
	margin-right: 10px;
	border-radius: 15px;
}

</style>
