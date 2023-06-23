<script setup lang="ts">

import { type PropType, computed } from "vue";
import { storeToRefs } from "pinia";

import UserAvatar from "./UserAvatar.vue";
import { useUserStore, type User } from "@/stores/user";
import type { Message } from "@/stores/chat";
import axios from "axios";
import { fetchChannels, notifyChannelChange, selectChannel } from "@/chat";

const { user: me } = storeToRefs (useUserStore ());

const props = defineProps ({
    channelId: String,
    message: Object as PropType<Message>,
});

const mine = computed (() => props.message?.sender.id == me.value?.id);

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
    if (!props.message?.channelInvite)
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
                :left="mine"
            />
        </div>

        <div class="chat-header">
            {{ message?.sender.nickname }}
        </div>

        <div class="chat-bubble" :class="mine ? 'chat-bubble-primary' : 'chat-bubble-secondary'">
            {{ message?.content }}

            <div v-if="message?.channelInvite">
                <div v-if="!mine" class="select-none">
                    {{ message?.channelInvite.channel.name }}: {{ message?.sender.username }} has invited you to this channel <br>
                </div>
                <div v-else class="select-none">
                    {{ message?.channelInvite.channel.name }}: you have invited this person to this channel <br>
                </div>

                <button v-if="!mine && !message?.channelInvite.accepted" class="btn normal-case" @click="acceptInvite ()">Accept</button>
                <button v-if="!mine && !message?.channelInvite.accepted && inviteHasExpired" class="btn normal-case" disabled>Expired</button>
                <button v-if="!mine && message?.channelInvite.accepted" class="btn normal-case" disabled>Accepted</button>
            </div>
        </div>

        <div class="chat-footer">
            <time class="text-xs opacity-50">{{ messageTimestamp }}</time>
        </div>
    </div>
</template>
