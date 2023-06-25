<script setup lang="ts">

import { fetchChannels, notifyChannelChange } from "@/chat";
import type { Channel } from "@/stores/chat";
import axios from "axios";
import { onMounted, ref } from "vue";

const publicChannels = ref ([] as Channel[]);
const selectedChannel = ref (null as Channel | null);
const password = ref ("");

async function fetchPublicChannels ()
{
    const result = await axios.get ("channels/public");
    publicChannels.value = result.data;
}

function selectChannel (chan: Channel | null)
{
    selectedChannel.value = chan;
    password.value = "";
}

async function joinChannel ()
{
    if (!selectedChannel.value)
        return;

    if (selectedChannel.value.isPasswordProtected)
    {
        await axios.post ("channels/" + selectedChannel.value.id + "/join", {password: password.value});
    }
    else
        await axios.post ("channels/" + selectedChannel.value.id + "/join");

    notifyChannelChange (selectedChannel.value.id);
    await fetchChannels ();
}

</script>

<template>
    <input type="checkbox" id="joinChannelModal" class="modal-toggle" @change="fetchPublicChannels ()" />
    <div class="modal">
        <div class="modal-box w-xs h-lg">
            <div class="overflow-auto grid" v-if="selectedChannel == null">
                <h3 class="text-lg font-bold">Join Channel</h3>

                <button class="btn normal-case m-2" v-for="(chan) in publicChannels" @click="selectChannel (chan)">
                    {{chan.name}} {{chan.description}}
                </button>
            </div>
            <div class="overflow-auto grid" v-else>
                <h3 class="text-lg font-bold">{{ selectedChannel.name }}</h3>
                <h2 class="text-md font-bold mb-6">{{ selectedChannel.description }}</h2>

                <span class="label-text w-full max-w-xs my-2 mr-2">Enter Channel Password</span>
                <input type="password" placeholder="Password" class="input input-bordered" v-model="password" :disabled="!selectedChannel.isPasswordProtected" />
            </div>

            <div>
                <button class="btn normal-case m-2" v-if="selectedChannel" @click="joinChannel ()">Join</button>
                <button class="btn normal-case m-2" v-if="selectedChannel" @click="selectChannel (null)">Back</button>
                <label class="btn normal-case m-2" for="joinChannelModal" @click="selectChannel (null)">Close</label>
            </div>
        </div>
    </div>
</template>
