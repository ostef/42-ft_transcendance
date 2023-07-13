<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex content-center justify-center place-content-center">
        <div class="flex content-center justify-center bg-gray-600 rounded-lg w-1/4" >
            <span class="label-text text-lg fontwin-bold mr-4 p-2">Waiting for player</span>
            <span class="loading loading-infinity loading-lg"></span>
        </div>
        <router-link to="/game/0" class="btn bg-gray-600" @click="$emit('disconnect')">Quit</router-link>
    </div>
</template>