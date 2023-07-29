<script setup lang="ts">

import {type PropType, onMounted, ref} from "vue";

import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";
import { type GameMatch } from "@/store";

const props = defineProps ({
    userId: String,
    matchHistory: Object as PropType<GameMatch[]>
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
        <tr v-for="match of matchHistory">
            <td class="flex flex-row space-x-4 items-center">
                <NonInteractiveAvatar :user="match.opponent"/>
                <span>{{ match.opponent.nickname }}</span>
            </td>
            <td>
                <span v-if="match.winner == userId">Victory</span>
                <span v-else>Defeat</span>
            </td>
            <td>{{ match.playerScore }}</td>
            <td>{{ match.opponentScore}}</td>
        </tr>
    </tbody>
</table>

</template>
