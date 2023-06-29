<script lang = "ts">

export default {

    data () {
        return {}
    }
}

</script>


<template>
    <div class="flex content-center justify-center">
        <span>You just lost the game</span>
        <router-link to="/test/0" class="btn normal-case bg-gray-600" @click="$emit('looseOk')">Return to Menu</router-link>
    </div>
</template>