<script setup lang="ts">

import Header from "./components/Header.vue";

import { RouterView } from "vue-router";

</script>

<template>
    <div class="h-screen">
        <Header />

        <RouterView />
    </div>
</template>
