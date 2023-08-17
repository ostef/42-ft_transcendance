<script setup lang="ts">

import { ref, type PropType } from "vue";

import { useStore, type Channel } from "@/store";
import axios from "axios";
import { notifyChannelChange } from "@/chat";

const store = useStore ();

const passwordForAuth = ref ("");
const name = ref ("");
const description = ref ("");
const password = ref ("");
const confirmPassword = ref ("");
const removePassword = ref (false);
const setPassword = ref (false);
const isPrivate = ref (false);

function setupFields ()
{
    if (!store.selectedChannel)
        return;

    name.value = store.selectedChannel.name;
    description.value = store.selectedChannel.description;
    isPrivate.value = store.selectedChannel.isPrivate;
    removePassword.value = false;
    setPassword.value = false;
    passwordForAuth.value = "";
}

async function updateChannel ()
{
    if (!store.selectedChannel)
        return;

    if (name.value.length == 0)
        throw new Error ("Name is empty");

    if (description.value.length == 0)
        throw new Error ("Description is empty");

    if (setPassword.value)
    {
        if (password.value.length == 0)
            throw new Error ("Password is empty");

        if (password.value != confirmPassword.value)
            throw new Error ("Password do not match");
    }

    await axios.put ("channels/" + store.selectedChannel.id, {
        passwordForAuth: store.selectedChannel.isPasswordProtected ? passwordForAuth.value : undefined,
        name: name.value,
        description: description.value,
        isPrivate: isPrivate.value,
        removePassword: removePassword.value,
        password: setPassword.value ? password.value : undefined
    });

    notifyChannelChange (store.selectedChannel.id);

    store.pushAlert ("success", "Updated channel settings");
}

</script>

<template>
    <input type="checkbox" id="channelSettingsModal" class="modal-toggle" @change="setupFields ()" />
    <div class="modal">
        <div class="modal-box w-xs h-lg grid">
            <div class="block">
                <label class="float-right btn rounded-full" for="channelSettingsModal">
                    <iconify-icon class="w-4 h-4" icon="gg:close" />
                </label>

                <h3 class="text-lg font-bold select-none">{{store.selectedChannel?.name}}</h3>
            </div>

            <div class="flex">
                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Private Channel</span>
                <input type="checkbox" class="toggle float-right my-2" v-model="isPrivate"
                    @change="if (isPrivate) { removePassword = true; setPassword = false; }" />
            </div>

            <div class="flex" v-if="store.selectedChannel?.isPasswordProtected">
                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Remove Password</span>
                <input type="checkbox" class="toggle float-right my-2" @change="if (removePassword) setPassword = false;" v-model="removePassword" />
            </div>

            <div class="flex">
                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Set Password</span>
                <input type="checkbox" class="toggle float-right my-2" :disabled="isPrivate || removePassword" v-model="setPassword" />
            </div>

            <span class="label-text my-2 mr-2 mt-6 select-none">Name</span>
            <input class="input input-bordered my-2 w-full max-w-xs"
                type="text" placeholder="Name" v-model="name" />

            <span v-if="setPassword" class="label-text my-2 mr-2 select-none">Password</span>
            <div v-if="setPassword" class="flex">
                <input class="input input-bordered my-2 mr-2 w-full max-w-xs"
                    type="password" placeholder="Password" v-model="password" />

                <input class="input input-bordered my-2 w-full max-w-xs"
                    type="password" placeholder="Confirm Password" v-model="confirmPassword" />
            </div>

            <span class="label-text my-2 mr-2 select-none">Description</span>
            <textarea class="textarea textarea-bordered my-2 w-full max-w-xs "
                placeholder="Description" v-model="description" />


            <span v-if="store.selectedChannel?.isPasswordProtected" class="label-text my-2 mr-2 select-none">Current Password</span>
            <div v-if="store.selectedChannel?.isPasswordProtected" class="flex">
                <input class="input input-bordered my-2 mr-2 w-full max-w-xs"
                    type="password" placeholder="Current Password" v-model="passwordForAuth" />
            </div>

            <button class="my-2 btn normal-case" @click="updateChannel ()">Update</button>
        </div>
    </div>
</template>
