<script setup lang="ts">
import { fetchChannels, notifyChannelChange } from "@/chat";
import type { Channel } from "@/stores/chat";
import axios from "axios";
import { onMounted, ref } from "vue";

const publicChannels = ref ([] as Channel[]);

async function fetchPublicChannels ()
{
    const result = await axios.get ("channels/public");
    publicChannels.value = result.data;
    console.log ("Fetched");
}

async function joinChannel (channelId: string)
{
    await axios.post ("channels/" + channelId + "/join");
    notifyChannelChange (channelId);
    await fetchChannels ();
}

</script>

<template>
    <input type="checkbox" id="joinChannelModal" class="modal-toggle" @change="fetchPublicChannels ()" />
    <div class="modal">
        <div class="modal-box w-xs h-lg">
            <div class="overflow-auto grid">
                <h3 class="text-lg font-bold">Join Channel</h3>

                <button class="btn normal-case m-2" v-for="(chan) in publicChannels" @click="joinChannel (chan.id)">
                    {{chan.name}} {{chan.description}}
                </button>
            </div>

            <div>
                <button class="btn normal-case m-2">Join</button>
                <label class="btn normal-case m-2" for="joinChannelModal">Close</label>
            </div>
        </div>
    </div>
</template>
