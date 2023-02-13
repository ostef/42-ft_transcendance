<template>
	<h1>Login</h1>

	<div id="login">
		<input type="text" name="username" v-model="input.username" placeholder="Username" />
		<input type="password" name="password" v-model="input.password" placeholder="Password" />
		<button type="button" @click="login()">Login</button>
	</div>
	
</template>

<script lang="ts">

export default {
	name: 'Login',
	data() {
		return {
			input: {
				username: "",
				password: ""
			}
		}
	},
	methods: {
		login(): void {
			console.log (`Username: ${this.input.username}, Password: ${this.input.password}`);
			this.$emit ("authenticated", true);
		}
	}
}

</script>

<style scoped>

#login input,button {
	display: block;
	margin: 0.5em;
}

</style>
