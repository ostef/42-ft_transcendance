<script setup lang="ts">

import UserAvatar from "@/components/UserAvatar.vue";
import {User, useStore} from "@/store";
import axios from "axios";
import {PropType, onMounted, ref} from "vue";
import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";

const props = defineProps ({
    user: Object as PropType<User>,
    showFull: Boolean ?? false,
});

interface MatchHistory
{
    opponent: User;
    playerScore: number;
    opponentScore: number;
    winner: string;
}

const store = useStore();
const matchHistory = ref ([] as MatchHistory[]);
const winNumber = ref (0);
const loseNumber = ref (0);
const winRate = ref (0);

onMounted (async () => {
    const res = await axios.get ("game/matchHistory/" + props.user?.id);

    if (res.data)  matchHistory.value = res.data;
    for (let i = 0; i < matchHistory.value.length; i++)
    {
        if (matchHistory.value[i].winner == props.user?.nickname)
            winNumber.value++;
        else
            loseNumber.value++;
    }
    winRate.value = Math.round((winNumber.value / matchHistory.value.length) * 100);
});

</script>

<template>
        <div id="matchHistory" class="flex flex-col space-y-4 w-fit">
            <h2 class="text-2xl">Match History</h2>
            <span v-if="matchHistory.length == 0">You have no match history yet</span>
            <div v-else class="overflow-x-auto">
                <div class="stats shadow">
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
                <table v-if="props.showFull" class="table table-zebra table-pin-cols text-center overflow-y-scroll">
                    <tbody>
                        <tr>
                            <th>Adversaire</th>
                            <th>Resultat</th>
                            <th>Score perso</th>
                            <th>Score adversaire</th>
                        </tr>
                        <tr v-for="match in matchHistory">
                            <td class="flex flex-row space-x-4 items-center">
                                <NonInteractiveAvatar :user="match.opponent"/>
                                <span>{{ match.opponent.nickname }}</span>
                            </td>
                            <td>
                                <span v-if="match.winner == match.opponent.nickname">Loose</span>
                                <span v-else>Victory</span>
                            </td>
                            <td>{{ match.playerScore }}</td>
                            <td>{{ match.opponentScore}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
</template>

<style scoped>

</style>