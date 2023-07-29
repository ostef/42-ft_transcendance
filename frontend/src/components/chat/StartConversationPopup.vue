<script setup lang="ts">

import { onMounted, ref } from 'vue';
import axios from 'axios';

import { useStore, type User } from '@/store';
import { selectPrivConv } from '@/chat';

import UserSelectionList from "./UserSelectionList.vue";

const users = ref ([] as User[]);

async function fetchUsers ()
{
    const store = useStore ();
    const allUsers = (await axios.get ("user/all")).data;

    users.value.length = 0;
    for (const friend of allUsers)
    {
        if (!store.hasPrivConv (friend.id))
            users.value.push (friend);
    }

    users.value.sort ((a, b) => (a.isFriend ? -1 : (b.isFriend ? 1 : -a.username.localeCompare (b.username))));
}

async function startConversation (user: User)
{
    const store = useStore ();
    const index = store.privateConvs.findIndex ((val) => val.id == user.id);
    if (index == -1)
        store.privateConvs.push (user);

    await selectPrivConv (user.id);
}

</script>

<template>
    <input type="checkbox" id="startConversationModal" class="modal-toggle" @change="fetchUsers ()" />
    <div class="modal">
        <div class="modal-box w-xs h-lg grid">
            <div class="block">
                <label class="float-right btn rounded-full" for="startConversationModal">
                    <iconify-icon class="w-4 h-4" icon="gg:close" />
                </label>

                <h3 class="text-lg font-bold select-none">Start Conversation</h3>
            </div>

            <UserSelectionList :users="users" @on-select="startConversation"/>
        </div>
    </div>
</template>
