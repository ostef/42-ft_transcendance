<template>

<div>
	<p>Message from the Backend: {{ msg }}</p>
</div>

</template>

<script lang="ts">

export default {
	name: 'AxiosTest',

	data () {
		return {
			msg: "",
		};
	},

	methods: {
		async getData () {
			try {
				const response = await this.$http.get ('/');
				this.msg = response.data;
			} catch (error) {
				console.error (error.message);
			}
		}
	},

	created() {
		this.getData();
	},
}

</script>
