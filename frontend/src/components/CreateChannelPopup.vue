<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

import { fetchChannels } from "@/chat";

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

    await axios.post ("channels", {
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
}

</script>

<template>
    <input type="checkbox" id="createChannelModal" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box w-xs h-lg grid">
            <h3 class="text-lg font-bold m-4 mb-6">Create Channel</h3>

            <div class="flex">
                <span class="label-text w-full max-w-xs my-2 mr-2">Private Channel</span>
                <input type="checkbox" class="toggle float-right my-2" v-model="isPrivate" />
            </div>

            <div class="flex">
                <span class="label-text w-full max-w-xs my-2 mr-2">Password Protected</span>
                <input type="checkbox" class="toggle float-right my-2" v-model="hasPassword" />
            </div>

            <span class="label-text my-2 mr-2 mt-6">Name</span>
            <input class="input input-bordered my-2 w-full max-w-xs"
                type="text" placeholder="Name" v-model="name" />

            <span v-if="hasPassword" class="label-text my-2 mr-2">Password</span>
            <div v-if="hasPassword" class="flex">
                <input class="input input-bordered my-2 mr-2 w-full max-w-xs"
                    type="password" placeholder="Password" v-model="password" />

                <input class="input input-bordered my-2 w-full max-w-xs"
                    type="password" placeholder="Confirm Password" v-model="confirmPassword" />
            </div>

            <span class="label-text my-2 mr-2">Description</span>
            <textarea class="textarea textarea-bordered my-2 w-full max-w-xs "
                placeholder="Description" v-model="description" />

            <button class="my-2 btn normal-case" @click="createChannel ()">Create</button>
            <label class="my-2 btn normal-case" for="createChannelModal">Close</label>
        </div>
    </div>
</template>
