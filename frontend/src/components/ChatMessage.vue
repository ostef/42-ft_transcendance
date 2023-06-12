<script setup lang="ts">

import UserAvatar from "./UserAvatar.vue";

defineProps ({
    username: String,
    picture: String,
    time: String,
    mine: Boolean,
    content: String,
});

</script>

<template>
    <div class="chat m-2" :class="mine ? 'chat-end' : 'chat-start'">
        <div class="chat-image">
            <UserAvatar :username="username" :picture="picture" :left="mine" />
        </div>

        <div class="chat-header">
            {{ username }}
        </div>

        <div class="chat-bubble" :class="mine ? 'chat-bubble-primary' : 'chat-bubble-secondary'">
            {{ content }}
        </div>

        <div class="chat-footer">
            <time class="text-xs opacity-50">{{ time }}</time>
        </div>
    </div>
</template>
