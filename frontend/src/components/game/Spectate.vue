<script lang = "ts">

import axios from "axios"
import type {SpectateGame} from "@/types/games.types"
import { GameSpectateDto } from "@/dto/game/game.dto"

export default {

    data () {
        return {
			gameSpectateList : [] as SpectateGame []
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
	}
}

</script>


<template>
    <div class="flex flex-col content-center justify-center place-items-center">
		<li v-for="game in gameSpectateList">
			{{ game.user1 }} - {{ game.user2 }} - {{ game.gameId }}
		</li>
        <router-link to="/test/0" class="btn normal-case bg-gray-600" @click="$emit('spectateEnd')">Return to Menu</router-link>
    </div>
</template>