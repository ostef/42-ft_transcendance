<script setup lang="ts">

import { selectChannel } from "@/chat";
import { useStore } from "@/store";

import JoinChannelPopup from "./JoinChannelPopup.vue";
import CreateChannelPopup from "./CreateChannelPopup.vue";

const store = useStore ();

</script>

<template>
    <div class="flex flex-col-reverse h-full">
        <div class="overflow-y-auto h-full">
            <button class="btn btn-block normal-case my-1 p-4 h-fit max-h-20 overflow-clip"
                v-for="(chan, index) in store.channels"
                :key="index"
                @click="selectChannel (chan.id)"
            >
                {{ chan.name }}
            </button>
        </div>

        <div class="lg:flex sm:flex-col lg:flex-row my-6">
            <div class="w-full lg:w-1/2 min-w-xs tooltip" data-tip="Join">
                <label for="joinChannelModal"
                    class="btn normal-case p-2 h-fit w-full bg-primary hover:bg-primary-focus text-primary-content"
                >
                    <iconify-icon class="w-4 h-4 m-2" icon="pepicons-pop:enter" />
                    <div class="hidden xl:inline">
                        Join Channel
                    </div>
                </label>
            </div>

            <div class="w-full lg:w-1/2 min-w-xs tooltip" data-tip="Create">
                <label for="createChannelModal" class="btn normal-case p-2 h-fit w-full bg-primary hover:bg-primary-focus text-primary-content">
                    <iconify-icon class="w-4 h-4 m-2" icon="fluent:tab-new-24-filled" />
                    <div class="hidden xl:inline">
                        Create Channel
                    </div>
                </label>
            </div>
        </div>

        <JoinChannelPopup />
        <CreateChannelPopup />

    </div>
</template>
