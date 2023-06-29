<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex content-center justify-center">
        <span>Game not found</span>
        <router-link to="/test/0" class="btn normal-case bg-gray-600" @click="$emit('GameNotFoundOk')">Return to Menu</router-link>
    </div>
</template>