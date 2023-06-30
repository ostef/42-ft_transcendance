<script setup lang="ts">

import { onMounted, ref } from "vue";
import axios from "axios";

import { fetchChannels, notifyChannelChange, selectChannel } from "@/chat";
import { useStore, type Channel } from "@/store";

import ChannelSelectionList from "./ChannelSelectionList.vue";

const publicChannels = ref ([] as Channel[]);
const selectedChannel = ref (null as Channel | null);
const password = ref ("");

async function fetchPublicChannels ()
{
    const store = useStore ();
    const result = await axios.get ("channels/public");

    publicChannels.value.length = 0;
    for (const chan of result.data)
    {
        if (!store.channels.find (val => val.id == chan.id))
            publicChannels.value.push (chan);
    }
}

function selectChannelToJoin (chan: Channel | null)
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
    await selectChannel (selectedChannel.value.id);
}

</script>

<template>
    <input type="checkbox" id="joinChannelModal" class="modal-toggle" @change="fetchPublicChannels (), selectChannelToJoin (null)" />
    <div class="modal">
        <div class="modal-box w-xs h-lg">
            <div class="overflow-auto grid" v-if="selectedChannel == null">
                <div class="block">
                    <label class="float-right btn rounded-full" for="joinChannelModal">
                        <iconify-icon class="w-4 h-4" icon="gg:close" />
                    </label>

                    <h3 class="text-lg font-bold select-none">Join Channel</h3>
                </div>

                <ChannelSelectionList :channels="publicChannels" @on-select="selectChannelToJoin" />
            </div>
            <div class="overflow-hidden grid" v-else>
                <div class="block">
                    <label class="float-right btn rounded-full" for="joinChannelModal">
                        <iconify-icon class="w-4 h-4" icon="gg:close" />
                    </label>

                    <h3 class="text-lg font-bold select-none">{{ selectedChannel.name }}</h3>
                </div>

                <h3 class="text-md mb-6 select-none truncate">{{ selectedChannel.description }}</h3>

                <span class="label-text w-full max-w-xs my-2 mr-2 select-none">Enter Channel Password</span>
                <input type="password" class="input input-bordered" v-model="password" :disabled="!selectedChannel.isPasswordProtected"
                    :placeholder="selectedChannel.isPasswordProtected ? 'Password' : 'No password is required'"
                />

                <div>
                    <button class="btn normal-case m-2" @click="joinChannel ()">Join</button>
                    <button class="btn normal-case m-2" @click="selectChannelToJoin (null)">Back</button>
                </div>
            </div>
        </div>
    </div>
</template>
