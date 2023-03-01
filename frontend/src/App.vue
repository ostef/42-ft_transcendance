<template>
	<div id="nav">
		<router-link v-if="authenticated" to="/login" @click.native="logout()" replace>Logout</router-link>
	</div>
	<router-view @authenticated="setAuthenticated" />
</template>

<script setup lang="ts">

import { ref } from 'vue';

const authenticated = ref (false);

function setAuthenticated (status: boolean): void
{
	authenticated.value = status;
}

function logout (): void
{
	setAuthenticated (false);
}

</script>

<style scoped>
</style>
