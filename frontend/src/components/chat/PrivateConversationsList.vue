<script setup lang="ts">
import { selectPrivConv } from "@/chat";
import { useStore } from "@/store";

import StartConversationPopup from "./StartConversationPopup.vue";
import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";

const store = useStore ();

</script>

<template>
    <div class="flex tooltip" data-tip="New Conv">
        <label for="startConversationModal" class="btn normal-case my-2 w-full h-fit p-2">
            <iconify-icon class="w-4 h-4 m-2" icon="octicon:comment-discussion-16" />
            <div class="hidden lg:inline">
                Start Conversation
            </div>
        </label>
    </div>
    <StartConversationPopup />

    <label class="flex flex-row btn btn-block normal-case my-2 p-2 h-fit"
        v-for="(user, index) in store.privateConvs"
        :key="index"
        @click="selectPrivConv (user.id)"
    >
        <div class="tooltip" :data-tip="user.username">
            <NonInteractiveAvatar :user="user" />
        </div>
        <div class="ml-4 hidden lg:flex flex-col">
            <h3 class="text-lg select-none">{{ user.nickname }}</h3>
            <h3 class="text-sm select-none">{{ user.username }}</h3>
        </div>
    </label>
</template>
