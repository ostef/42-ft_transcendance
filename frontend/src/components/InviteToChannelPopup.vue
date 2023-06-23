<script setup lang="ts">

import axios from "axios";
import { onMounted, ref } from "vue";

import type { User } from "@/stores/user";
import { useChatStore } from "@/stores/chat";

import NonInteractiveAvatar from "./NonInteractiveAvatar.vue";

const name = ref ("");
const friends = ref ([] as User[]);

const chatStore = useChatStore ();

onMounted (async () => {
    const result = await axios.get ("user/friends");

    friends.value = result.data;
});

function inviteToChannel (userId: string)
{

}

</script>

<template>
<input type="checkbox" id="inviteToChannelModal" class="modal-toggle" />
<div class="modal">
    <div class="modal-box w-xs h-lg grid">
        <button v-for="friend of friends" class="btn normal-case">
            <NonInteractiveAvatar class="mx-4" :user="friend" />

            {{ friend.nickname }} ({{ friend.username }})
        </button>

        <label class="my-2 btn normal-case" for="inviteToChannelModal">Close</label>
    </div>
</div>
</template>

