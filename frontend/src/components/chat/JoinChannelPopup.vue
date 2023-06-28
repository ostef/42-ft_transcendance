<script setup lang="ts">

import { onMounted, ref } from "vue";
import axios from "axios";

import { fetchChannels, notifyChannelChange } from "@/chat";
import { useChatStore, type Channel } from "@/stores/chat";

import ChannelSelectionList from "./ChannelSelectionList.vue";

const publicChannels = ref ([] as Channel[]);
const selectedChannel = ref (null as Channel | null);
const password = ref ("");

async function fetchPublicChannels ()
{
    const chatStore = useChatStore ();
    const result = await axios.get ("channels/public");

    publicChannels.value.length = 0;
    for (const chan of result.data)
    {
        if (!chatStore.channels.find (val => val.id == chan.id))
            publicChannels.value.push (chan);
    }
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
                <div class="block">
                    <label class="float-right btn rounded-full" for="joinChannelModal" @click="selectChannel (null)">
                        <iconify-icon class="w-4 h-4" icon="gg:close" />
                    </label>

                    <h3 class="text-lg font-bold select-none">Join Channel</h3>
                </div>

                <ChannelSelectionList :channels="publicChannels" @on-select="selectChannel" />
            </div>
            <div class="overflow-auto grid" v-else>
                <h3 class="text-lg font-bold select-none">{{ selectedChannel.name }}</h3>
                <h2 class="text-md font-bold mb-6 select-none">{{ selectedChannel.description }}</h2>

                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Enter Channel Password</span>
                <input type="password" class="input input-bordered" v-model="password" :disabled="!selectedChannel.isPasswordProtected"
                    :placeholder="selectedChannel.isPasswordProtected ? 'Password' : 'No password is required'"
                />
            </div>

            <div>
                <button class="btn normal-case m-2" v-if="selectedChannel" @click="joinChannel ()">Join</button>
                <button class="btn normal-case m-2" v-if="selectedChannel" @click="selectChannel (null)">Back</button>
            </div>
        </div>
    </div>
</template>
