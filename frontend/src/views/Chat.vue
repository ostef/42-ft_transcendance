<script setup lang="ts">

import ChatMessage from "../components/ChatMessage.vue";

</script>

<template>
    <div class="flex w-full h-3/4">
        <!-- <ChatDiscussionList /> -->
        <div class="w-1/4 overflow-y-auto mx-2 p-4 bg-base-200">
        </div>

        <div class="w-3/4 overflow-y-auto mx-2 p-4 bg-base-200">
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 1" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 2" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 3" :mine=true />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 4" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 5" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 6" :mine=true />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 7" :mine=true />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 8" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 9" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 10" :mine=true />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 11" :mine=false />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 12" :mine=true />
            <ChatMessage username="soumanso" picture="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" time="12:45" content="Hello Sailor 13" :mine=false />
        </div>

        <div class="w-1/4 overflow-y-auto mx-2 p-4 bg-base-200">
        </div>
    </div>
</template>
