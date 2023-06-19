<script setup lang="ts">

import { type PropType, computed } from "vue";
import { storeToRefs } from "pinia";

import UserAvatar from "./UserAvatar.vue";
import { useUserStore, type User } from "@/stores/user";
import type { Message } from "@/stores/chat";

const { user: me } = storeToRefs (useUserStore ());

const props = defineProps ({
    channelId: String,
    message: Object as PropType<Message>,
    online: Boolean,
    isAdmin: Boolean,
    isMuted: Boolean,
    iAmAdmin: Boolean,
});

const mine = computed (() => { return props.message?.sender.id == me.value?.id; });

const messageTimestamp = computed (() =>
{
    if (!props.message)
        return "";

    const now = new Date ();
    const date = new Date (props.message.date);

    if (date.getDate () != now.getDate ()
    || date.getMonth () != now.getMonth ()
    || date.getFullYear () != now.getFullYear ())
        return date.toLocaleString ();

    return date.toLocaleTimeString ();
});

</script>

<template>
    <div class="chat m-2" :class="mine ? 'chat-end' : 'chat-start'">
        <div class="chat-image">
            <UserAvatar
                :user="message?.sender"
                :channelId="channelId"
                :isOnline="online"
                :left="mine"
                :isAdmin="isAdmin"
                :isMuted="isMuted"
                :iAmAdmin="iAmAdmin"
            />
        </div>

        <div class="chat-header">
            {{ message?.sender.nickname }}
        </div>

        <div class="chat-bubble" :class="mine ? 'chat-bubble-primary' : 'chat-bubble-secondary'">
            {{ message?.content }}
        </div>

        <div class="chat-footer">
            <time class="text-xs opacity-50">{{ messageTimestamp }}</time>
        </div>
    </div>
</template>
