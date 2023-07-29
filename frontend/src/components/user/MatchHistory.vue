<script setup lang="ts">

import {type User, useStore} from "@/store";
import axios from "axios";
import {type PropType, onMounted, ref} from "vue";
import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";

export type MatchHistory =
{
    opponent: User;
    playerScore: number;
    opponentScore: number;
    winner: string;
}

const props = defineProps ({
    userId: String,
});

const matchHistory = ref ([] as MatchHistory[]);

onMounted (async () => {
    if (!props.userId)
        return;

    matchHistory.value = (await axios.get ("game/match-history/" + props.userId)).data;
});

</script>

<template>

<table class="table table-zebra table-pin-cols text-center p-2">
    <tbody>
        <tr>
            <th>Opponent</th>
            <th>Result</th>
            <th>Score</th>
            <th>Opponent Score</th>
        </tr>
        <tr v-for="match in matchHistory">
            <td class="flex flex-row space-x-4 items-center">
                <NonInteractiveAvatar :user="match.opponent"/>
                <span>{{ match.opponent.nickname }}</span>
            </td>
            <td>
                <span v-if="match.winner == match.opponent.id">Loose</span>
                <span v-else>Victory</span>
            </td>
            <td>{{ match.playerScore }}</td>
            <td>{{ match.opponentScore}}</td>
        </tr>
    </tbody>
</table>

</template>
