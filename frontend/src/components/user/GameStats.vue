<script setup lang="ts">
import { ref, type PropType, computed } from 'vue';

import { type GameMatch } from "@/store";

const props = defineProps ({
    userId: String,
    matchHistory: Object as PropType<GameMatch[]>
});

const winNumber = computed (() => {
    if (!props.matchHistory || !props.userId)
        return 0;

    let result = 0;
    for (const hist of props.matchHistory)
    {
        if (hist.winner == props.userId)
            result += 1;
    }

    return result;
});

const loseNumber = computed (() => {
    if (!props.matchHistory || !props.userId)
        return 0;

    let result = 0;
    for (const hist of props.matchHistory)
    {
        if (hist.winner != props.userId)
            result += 1;
    }

    return result;
});

const winRate = computed (() => {
    if (!props.matchHistory || props.matchHistory.length == 0)
        return 0;

    return Math.round (100 * winNumber.value / props.matchHistory.length)
});

</script>

<template>

<div class="stats shadow select-none p-2">
    <div class="stat">
        <div class="stat-title">Matches</div>
        <div class="stat-value">{{ matchHistory?.length ?? 0 }}</div>
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
