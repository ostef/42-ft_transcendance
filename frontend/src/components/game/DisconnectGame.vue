<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex flex-col content-center justify-center place-items-center">
        <span class="m-5 font-bold">The other player disconnected, its a win but its pretty sad</span>
        <button class="btn normal-case bg-base-600" @click="$emit('disconnectGameOk')">Return to Menu</button>
    </div>
</template>