<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex flex-col content-center justify-center place-items-center">
        <span class="m-5 font-bold">The other player disconnected</span>
        <router-link to="/game/0" class="btn normal-case bg-base-600" @click="$emit('disconnectOk')">Return to Menu</router-link>
    </div>
</template>