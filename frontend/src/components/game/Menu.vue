<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex content-center justify-center">
        <button class="btn normal-case bg-gray-600" @click="$emit('on-search')">Search Game</button>
	    <button class="btn normal-case bg-gray-600" @click="$emit('on-create')">Create Game</button>
    </div>
</template>