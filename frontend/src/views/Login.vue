<template>
	<h1>Login</h1>

	<div id="login">
		<input type="text" name="username" v-model="username" placeholder="Username" />
		<input type="password" name="password" v-model="password" placeholder="Password" />
		<button type="button" @click="login()">Login</button>
	</div>

</template>

<script setup lang="ts">

import { ref } from 'vue';

const username = ref ("");
const password = ref ("");

const emit = defineEmits <{
	(e: "authenticated", val: boolean): void
}> ();

function login(): void
{
	console.log (`Username: ${username}, Password: ${password}`);
	emit ("authenticated", true);
}

</script>

<style scoped>

#login input,button {
	display: block;
	margin: 0.5em;
}

.ball {
	margin: 0.5em;
}

</style>
