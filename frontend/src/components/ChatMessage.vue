<script setup lang="ts">

import UserAvatar from "./UserAvatar.vue";

defineProps ({
    userId: String,
    username: String,
    picture: String,
    online: Boolean,
    isBlocked: Boolean,
    isFriend: Boolean,
    nickname: String,
    mine: Boolean,
    content: String,
    time: String,
});

</script>

<template>
    <div class="chat m-2" :class="mine ? 'chat-end' : 'chat-start'">
        <div class="chat-image">
            <UserAvatar
                :userId="userId"
                :username="username"
                :nickname="nickname"
                :picture="picture"
                :online="online"
                :isBlocked="isBlocked"
                :isFriend="isFriend"
                :left="mine"
            />
        </div>

        <div class="chat-header">
            {{ nickname }}
        </div>

        <div class="chat-bubble" :class="mine ? 'chat-bubble-primary' : 'chat-bubble-secondary'">
            {{ content }}
        </div>

        <div class="chat-footer">
            <time class="text-xs opacity-50">{{ time }}</time>
        </div>
    </div>
</template>
