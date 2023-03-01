<template>

<div>
	<p>Message from the Backend: {{ message }}</p>
</div>

</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import axios from 'axios';

const message = ref ("");

async function getData (): Promise<void>
{
	try
	{
		const response = await axios.get ('/');
		message.value = response.data;
	}
	catch (error: any)
	{
		console.error (error.message);
	}
}

onMounted (() => {
	getData ();
});

</script>
