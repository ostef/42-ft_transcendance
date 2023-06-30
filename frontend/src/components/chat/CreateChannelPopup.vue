<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

import { fetchChannels, selectChannel } from "@/chat";

const name = ref ("");
const description = ref ("");
const password = ref ("");
const confirmPassword = ref ("");
const hasPassword = ref (false);
const isPrivate = ref (false);

async function createChannel ()
{
    if (name.value.length == 0)
        throw new Error ("Name is empty");

    if (description.value.length == 0)
        throw new Error ("Description is empty");

    if (hasPassword.value)
    {
        if (password.value.length == 0)
            throw new Error ("Password is empty");

        if (password.value != confirmPassword.value)
            throw new Error ("Password do not match");
    }

    const res = await axios.post ("channels", {
        name: name.value,
        description: description.value,
        isPrivate: isPrivate.value,
        password: hasPassword.value ? password.value : undefined
    });

    name.value = "";
    description.value = "";
    password.value = "";
    confirmPassword.value = "";
    hasPassword.value = false;
    isPrivate.value = false;

    await fetchChannels ();
    await selectChannel (res.data);
}

</script>

<template>
    <input type="checkbox" id="createChannelModal" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box w-xs h-lg grid">
            <div class="block">
                <label class="float-right btn rounded-full" for="createChannelModal">
                    <iconify-icon class="w-4 h-4" icon="gg:close" />
                </label>

                <h3 class="text-lg font-bold select-none">Create Channel</h3>
            </div>

            <div class="flex">
                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Private Channel</span>
                <input type="checkbox" class="toggle float-right my-2" @change="if (isPrivate) hasPassword = false;" v-model="isPrivate" />
            </div>

            <div class="flex">
                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Password Protected</span>
                <input type="checkbox" class="toggle float-right my-2" :disabled="isPrivate" v-model="hasPassword" />
            </div>

            <span class="label-text my-2 mr-2 mt-6 select-none">Name</span>
            <input class="input input-bordered my-2 w-full max-w-xs"
                type="text" placeholder="Name" v-model="name" />

            <span v-if="hasPassword" class="label-text my-2 mr-2 select-none">Password</span>
            <div v-if="hasPassword" class="flex">
                <input class="input input-bordered my-2 mr-2 w-full max-w-xs"
                    type="password" placeholder="Password" v-model="password" />

                <input class="input input-bordered my-2 w-full max-w-xs"
                    type="password" placeholder="Confirm Password" v-model="confirmPassword" />
            </div>

            <span class="label-text my-2 mr-2 select-none">Description</span>
            <textarea class="textarea textarea-bordered my-2 w-full max-w-xs "
                placeholder="Description" v-model="description" />

            <button class="my-2 btn normal-case" @click="createChannel ()">Create</button>
        </div>
    </div>
</template>
