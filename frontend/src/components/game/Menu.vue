<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex content-center justify-center">
        <button class="btn normal-case btn-primary m-2" @click="$emit('on-search')">Search Game</button>
	    <button class="btn normal-case btn-primary m-2" @click="$emit('on-create')">Create Game</button>
		<button class="btn normal-case btn-primary m-2" @click="$emit('on-spectate')">Spectate Game</button>
    </div>
</template>