<script setup lang="ts">
import { ref, type PropType, onMounted } from 'vue';

import type { User } from '@/store';
import type { MatchHistory } from './MatchHistory.vue';
import axios from 'axios';

const props = defineProps ({
    userId: String,
});

const matchHistory = ref ([] as MatchHistory[]);
const winNumber = ref (0);
const loseNumber = ref (0);
const winRate = ref (0);

async function fetchMatchHistory ()
{
    if (!props.userId)
        return;

    matchHistory.value = (await axios.get ("game/match-history/" + props.userId)).data;

    winNumber.value = 0;
    loseNumber.value = 0;
    for (let i = 0; i < matchHistory.value.length; i++)
    {
        if (matchHistory.value[i].winner == props.userId)
            winNumber.value++;
        else
            loseNumber.value++;
    }

    winRate.value = Math.round ((winNumber.value / matchHistory.value.length) * 100);
}

onMounted (async () => {
    await fetchMatchHistory ();
});

</script>

<template>

<div class="stats shadow select-none p-2">
    <div class="stat">
        <div class="stat-title">Matches</div>
        <div class="stat-value">{{ matchHistory.length }}</div>
    </div>
    <div class="stat">
        <div class="stat-title">Total Win</div>
        <div class="stat-value text-success">{{ winNumber }}</div>
    </div>
    <div class="stat">
        <div class="stat-title">Total Lose</div>
        <div class="stat-value text-error">{{ loseNumber }}</div>
    </div>
    <div class="stat">
        <div class="stat-title">Win rate</div>
        <div class="stat-value text-info">{{ winRate }}%</div>
    </div>
</div>

</template>
