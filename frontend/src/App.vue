<template>
	<router-view />
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
