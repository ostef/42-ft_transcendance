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
		spectateGame = getResult.data
		this.gameSpectateList = spectateGame.games
		console.log(this.gameSpectateList)
	},

	methods : {

		startSpectate(gameId : number, gameDifficulty : string)
		{
			console.log("Lauching event to spectate game : " + gameId)
			this.$emit('spectateGame', gameId, gameDifficulty)
		},
	}
}

</script>


<template>
    <div class="flex flex-col content-center justify-center place-items-center">
		<li class="list-none rounded-lg bg-green-400 pl-4 font-bold" v-for="game in gameSpectateList">
			Game {{ game.gameId }} : {{ game.user1 }} - {{ game.user2 }}
			<button class="btn normal-case bg-green-400 ml-4" @click="startSpectate(game.gameId, game.difficulty)">Spectate</button>
		</li>
        <router-link to="/test/0" class="btn normal-case bg-gray-600" @click="$emit('spectateEnd')">Return to Menu</router-link>
    </div>
</template>