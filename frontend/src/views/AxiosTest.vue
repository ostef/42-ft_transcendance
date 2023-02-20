<template>

<div>
	<div v-for="post in posts" v-bind:key="post.id">
		<h2>{{ post.title }}</h2>
		<p>{{ post.body }}</p>
	</div>
</div>

</template>

<script lang="ts">

export default {
	name: 'AxiosTest',

	data () {
		return {
			posts: [],
		};
	},

	methods: {
		async getData () {
			try {
				const response = await this.$http.get (
					'/posts'
				);
				this.posts = response.data;
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
