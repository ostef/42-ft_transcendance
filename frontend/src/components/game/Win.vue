<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex content-center justify-center">
        <span>You just won the game</span>
        <router-link to="/test/0" class="btn normal-case bg-gray-600" @click="$emit('winOk')">Return to Menu</router-link>
    </div>
</template>