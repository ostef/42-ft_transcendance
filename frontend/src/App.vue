<template>
	<div id="nav">
		<router-link v-if="authenticated" to="/login" @click.native="logout()" replace>Logout</router-link>
	</div>
	<router-view @authenticated="setAuthenticated" />
</template>

<script lang="ts">

export default {
	name: 'App',
	data() {
		return {
			authenticated: false,
		}
	},
	mounted(): void {
		//if (!this.authenticated) {
		//	this.$router.replace ({ name: 'login' });
		//}
	},
	methods: {
		setAuthenticated (status: boolean): void {
			this.authenticated = status;
		},

		logout (): void {
			this.authenticated = false;
		}
	}
}

</script>

<style scoped>
</style>
