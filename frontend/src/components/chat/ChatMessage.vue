<script setup lang="ts">

import { type PropType, computed } from "vue";
import axios from "axios";

import { useStore, type User, type Message } from "@/store";
import { fetchChannels, notifyChannelChange, selectChannel } from "@/chat";

import UserAvatar from "@/components/UserAvatar.vue";

const store = useStore ();

const props = defineProps ({
    channelId: String,
    message: Object as PropType<Message>,
});

const mine = computed (() => props.message?.sender.id == store.loggedUser?.id);

const messageTimestamp = computed (() =>
{
    if (!props.message)
        return "";

    const now = new Date ();
    const date = new Date (props.message.date);

    if (date.getDate () != now.getDate ()
    || date.getMonth () != now.getMonth ()
    || date.getFullYear () != now.getFullYear ())
        return date.toLocaleString ();

    return date.toLocaleTimeString ();
});

const inviteHasExpired = computed (() => {
    if (!props.message?.channelInvite)
        return false;

    const now = new Date ();
    const date = new Date (props.message.channelInvite.expirationDate);

    return now > date;
});

async function acceptInvite ()
{
    if (!props.message?.channelInvite || !store.loggedUser)
        return;

    await axios.post ("channels/invite/" + props.message.channelInvite.id + "/accept");
    await fetchChannels ();
    notifyChannelChange (props.message.channelInvite.channel.id);
    props.message.channelInvite.accepted = true;

    selectChannel (props.message.channelInvite.channel.id);
}

</script>

<template>
    <div class="chat m-2" :class="mine ? 'chat-end' : 'chat-start'">
        <div class="chat-image">
            <UserAvatar
                :user="message?.sender"
                :channelId="channelId"
                :dropdownClass="mine ? 'dropdown-left' : 'dropdown-right'"
            />
        </div>

        <div class="chat-header select-none">
            {{ message?.sender.nickname }}
        </div>

        <div class="chat-bubble max-w-md break-all" :class="mine ? 'chat-bubble-primary' : 'chat-bubble-secondary'">
            {{ message?.content }}

            <div v-if="message?.channelInvite">
                <div v-if="!mine" class="select-none text-sm italic">
                    {{ message?.channelInvite.channel?.name ?? "deleted channel" }}: {{ message?.sender.username }} has invited you to this channel <br>
                </div>
                <div v-else class="select-none text-sm italic">
                    {{ message?.channelInvite.channel?.name ?? "deleted channel" }}: you have invited this person to this channel <br>
                </div>

                <button v-if="!mine && !message?.channelInvite.channel"
                    class="btn btn-disabled normal-case m-4"
                >
                    Deleted Channel
                </button>
                <button v-else-if="!mine && !message?.channelInvite.accepted && inviteHasExpired"
                    class="btn btn-disabled normal-case m-4"
                >
                    Expired
                </button>
                <button v-else-if="!mine && !message?.channelInvite.accepted"
                    class="btn normal-case m-4" @click="acceptInvite ()"
                >
                    Accept
                </button>
                <button v-else-if="!mine && message?.channelInvite.accepted"
                    class="btn btn-disabled normal-case m-4"
                >
                    Accepted
                </button>
            </div>
        </div>

        <div class="chat-footer select-none">
            <time class="text-xs opacity-50">{{ messageTimestamp }}</time>
        </div>
    </div>
</template>
