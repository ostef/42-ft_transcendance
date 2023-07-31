<script lang = "ts">

import axios from "axios"
import type {SpectateGame} from "@/types/games.types"
import { GameSpectateDto } from "@/dto/game/game.dto"

export default {

    data () {
        return {
			gameSpectateList : [] as SpectateGame [],
			count : 0 as number
		}
    },

	async mounted()
	{
		let spectateGame = {} as GameSpectateDto
		spectateGame.games = [] as SpectateGame[]
		let getResult = await axios.get("game/Spectate")
		if (getResult == null)
		{
			this.$emit('spectateEnd')
			return
		}
		spectateGame = getResult.data
		this.gameSpectateList = spectateGame.games
	},

	methods : {

		startSpectate(gameId : number, gameDifficulty : string, gameColor : string)
		{
			//console.log("Lauching event to spectate game : " + gameId)
			this.$emit('spectateGame', gameId, gameDifficulty, gameColor)
		},
	}
}

</script>


<template>
    <div class="flex flex-col content-center justify-center place-items-center">
		<li class="list-none rounded-lg bg-base-200 pl-4 font-bold mt-4" v-for="game in gameSpectateList">
			Game {{ game.gameId }} : {{ game.user1 }} - {{ game.user2 }}
			<button class="btn normal-case bg-primary mx-2 ml-4" @click="startSpectate(game.gameId, game.difficulty, game.color)">Spectate</button>
		</li>
        <router-link to="/game/0" class="btn normal-case bg-primary mt-4" @click="$emit('spectateEnd')">Return to Menu</router-link>
    </div>
</template>