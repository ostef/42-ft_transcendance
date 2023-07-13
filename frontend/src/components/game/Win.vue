<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex flex-col content-center justify-center place-items-center">
        <span class="m-5 font-bold">You just won the game</span>
        <router-link to="/game/0" class="btn normal-case bg-gray-600" @click="$emit('winOk')">Return to Menu</router-link>
    </div>
</template>