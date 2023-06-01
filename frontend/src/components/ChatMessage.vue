<script setup lang="ts">

defineProps ({
    username: String,
    picture: String,
    time: String,
    mine: Boolean,
    content: String,
});

</script>

<template>
    <div class="chat m-4" :class="mine ? 'chat-end' : 'chat-start'">
        <div class="chat-image avatar">
            <div class="h-12 w-12 rounded-full overflow-hidden">
                <img :src="picture" />
                <!-- <iconify-icon icon="ri:account-circle-line" class="h-12 w-12 rounded-full" /> -->
            </div>
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
