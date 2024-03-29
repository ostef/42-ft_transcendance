<template>
    <div class="place-content-center content-center justify-center">
		<MenuComp v-if="menu" @on-search="searchGame()" @on-create="createGame()" @on-spectate="spectateGame()"/>
		<div class="flex justify-center font-bold text-6xl text-primary-content" v-show="game">
			<div class="h-4/6" id="player1-score">0</div>
			<div class="h-2/6">-</div>
			<div class="h-4/6" id="player2-score">0</div>
		</div>
		<WaitingForPlayerVue v-if="waitingPlayer" @disconnect="disconnectPlayerWaiting"/>
		<div class="flex flex-none content-center justify-center place-content-center">
			<canvas class="flex-none w-3/5 border-4 mt-12 h-3/5 mb-10" id="myCanvas" v-show="game"></canvas>
		</div>
		<Spectate v-if="spectate" @spectateEnd="returnToMenu" @spectateGame="startSpectateGame"/>
		<ConfigurateComp v-if="configurate" @on-config="configurateChoice" @disconnect="disconnectPlayerWaiting"/>
		<DisconnectVue v-if="disconnect" @disconnectOk="returnToMenu" />
		<LooseVue v-if="lost" @looseOk="returnToMenu" />
		<WinVue v-if="won" @winOk="returnToMenu" />
		<DisconnectGameVue v-if="disconnectGame" @disconnectGameOk="returnToMenu"/>
		<GameNotFoundVue v-if="gameNotFoundState" @gameNotFoundOk="returnToMenu" />
    </div>
</template>

<script lang="ts">

import io from "socket.io-client";
import Socket from "socket.io-client"
import { defineComponent } from "vue";
import Ball from "../script/game/Ball"
import Paddle from "../script/game/Paddle"
import App from "../App.vue";
import { useStore } from "@/store";
import { storeToRefs } from 'pinia';
import MenuComp from "../components/game/Menu.vue"
import ConfigurateComp from "../components/game/Configurate.vue"
import WaitingForPlayerVue from '../components/game/WaitingForPlayer.vue';
import DisconnectVue from '../components/game/Disconnect.vue';
import WinVue from '../components/game/Win.vue';
import LooseVue from "@/components/game/Loose.vue";
import DisconnectGameVue from "@/components/game/DisconnectGame.vue"
import GameNotFoundVue from '@/components/game/GameNotFound.vue'
import Spectate from "@/components/game/Spectate.vue";
import { chatSocket } from "@/chat";
import type { Point, PaddlePos, Score } from "@/types/games.types";

export default {
    name : 'TestSocket',
    components : {
		MenuComp,
		ConfigurateComp,
		WaitingForPlayerVue,
		DisconnectVue,
		WinVue,
		LooseVue,
		DisconnectGameVue,
		GameNotFoundVue,
		Spectate,
    },
    data () {
        return {
			socket : {} as ReturnType<typeof io>,


			//Game related objects
			context : {} as CanvasRenderingContext2D | null,
			ball :  {} as Ball,
			paddleLeft : {} as Paddle,
			paddleRight : {} as Paddle,
			leftScore : {} as HTMLElement | null,
			rightScore : {} as HTMLElement | null,
			canvas : {} as HTMLCanvasElement | null,

			//Drawing informations about canvas position on the window
			canvasAbsoluteSize : 60/100,
			canvasAbsoluteStart : 20/100,
			canvasAbsoluteEnd : 0,
			canvaspos : {} as DOMRect,


			gameId : 0,
			waiting : false as boolean,
			isPlaying : false as boolean,
			intervalId : {} as ReturnType<typeof setInterval>,
			delta : 15,

			//Game configuration options
			ownPaddle : "",
			difficulty : "default" as string,
			color : "" as string,
			initialised : false,

			inviteId : "" as string,

			store: {} as ReturnType<typeof useStore>,


			//VUE js Components states
			menu : true,
			game : false,
			configurate : false,
			waitingPlayer : false,
			disconnect : false,
			won : false,
			lost : false,
			disconnectGame : false,
			gameNotFoundState : false,
			spectate : false,
			isSpectating : false,
        }
    },
    created () {
        //console.log("Starting connection to websocket server")
        this.socket = io(
			"http://" + window.location.hostname + ":3000/game",
			{
				auth: { token: localStorage.getItem ("token") }
			}
		);

		//Events to connect and handle errors
		this.socket.on("onConnection" , data => {
			//console.log(data.id)
		})
		this.socket.on('disconnect', () =>
		{
			console.log("Disconnection from Game Socket")
		})
		this.socket.on("connect_error", data => {
			this.store.pushAlert("error", data.message)
		})
		this.socket.on("error", data => {
			this.store.pushAlert("error", data)
		})
		this.socket.on("exception", data => {
			this.store.pushAlert("error", data)
		})


		//Events to join waiting room or games
		this.socket.on("foundGame", (playerPos : string, gameId : number , difficulty : string, color : string) => {
			this.difficulty = difficulty
			if (this.canvas)
			{
				this.paddleLeft = new Paddle("canvas", "grey", 0.01 * this.canvas.width, true, this.difficulty)
				this.paddleRight = new Paddle("canvas", "grey", this.canvas.width - 0.01 * this.canvas.width, false, this.difficulty)
			}
			this.menu = false
			this.game = true
			this.waitingPlayer = false
			chatSocket.emit("joinOrLeaveGame")
			this.joinGame(playerPos, gameId, difficulty, color)
		})
		this.socket.on("configurateGame", (gameId : number) => {
			this.configureGame(gameId)
		})
		this.socket.on("alreadyGaming", () =>{
			this.alreadyGaming()
		})

		//Game events on updtaing padddle, ball and score
		this.socket.on("ballUpdate", (data : Point) => {
			this.updateBall(data)
		})


		this.socket.on("ownPaddle", (data : PaddlePos) => {
			this.updateOwnPadle(data)
		})
		this.socket.on("otherPaddle", (data : PaddlePos) => {
			this.updateOtherPaddle(data)
			this.drawFrame()
		})

		this.socket.on("score", (data : Score) => {
			this.updateScore(data)
		})


		//Game events for the end of the game
		this.socket.on("winGame", () => {
			chatSocket.emit("joinOrLeaveGame")
			this.handleWin()
		})
		this.socket.on("looseGame", () => {
			chatSocket.emit("joinOrLeaveGame")
			this.handleLoose()
		})

		//Event d'invitation
		this.socket.on("waitingPlayerInvite", () => {
			this.waitPlayer2()
		})
		this.socket.on("gameNotFound", () => {
			this.gameNotFound()
		})
		this.socket.on("joinedGameInvite", (data : number) => {
			this.joinedGameInvite(data)
		})
		this.socket.on('otherPlayerDisconnectedGame', () => {
			chatSocket.emit("joinOrLeaveGame")
			this.playerDisconnectGame()
		})
		this.socket.on('OtherPlayerDisconnected', () => {
			this.playerDisconnect()
		})

		//Event de spectate
		this.socket.on('endOfSpectate', () => {
			this.endSpectate()
		})
		this.socket.on('endOfSpectateDisconnect', () => {
			this.spectateDisconnect()
		})
    },

	mounted() {
		if (typeof this.$route.params.id === "string")
			this.inviteId = this.$route.params.id
		else
			this.inviteId = this.$route.params.id[0]
		this.store = useStore();

		this.canvas = document.querySelector("canvas")
		if (this.canvas)
		{
			this.context = this.canvas.getContext("2d")
			this.canvas.height = window.innerHeight * this.canvasAbsoluteSize
			this.canvas.width = window.innerWidth * this.canvasAbsoluteSize

			this.ball = new Ball("canvas", 100, 100, {x: 10 , y: 10}, "grey", 0.008 * this.canvas.width, this.delta)
			this.leftScore = document.getElementById("player1-score")
			this.rightScore = document.getElementById("player2-score")
		}
		this.isPlaying = false

		if (this.inviteId[0] == 'c')
		{
			this.inviteId = this.inviteId.slice(1)
			this.creatorGameInvite(this.inviteId)
		}
		else if (this.inviteId[0] == 'j')
		{
			this.inviteId = this.inviteId.slice(1)
			this.joinGameInvite(this.inviteId)
		}


		document.addEventListener("mousemove", e => {
			let mouseHeight = 0

			if (this.isPlaying)
			{
				if (!this.initialised)
				{
					if (this.canvas)
					{
						this.canvaspos = this.canvas.getBoundingClientRect()
						this.canvasAbsoluteStart = this.canvaspos.top / window.innerHeight
						this.canvasAbsoluteEnd = this.canvaspos.bottom / window.innerHeight
						this.initialised = true
					}
				}
				if (e.y <= (window.innerHeight * this.canvasAbsoluteStart) + this.paddleLeft.getHeight() / 2)
				{
					if (this.canvas)
					{
						mouseHeight = (this.paddleLeft.getHeight() / 2) / this.canvas.height
						this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
					}
					return
				}
				else if (e.y >= window.innerHeight * this.canvasAbsoluteEnd - this.paddleLeft.getHeight() / 2)
				{
					if (this.canvas)
						mouseHeight = (this.canvas.height - this.paddleLeft.getHeight() / 2) / this.canvas.height
					this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
					return
				}
				if (this.canvas)
				{
					mouseHeight = (e.y - window.innerHeight * this.canvasAbsoluteStart) / this.canvas.height
					this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
				}
			}
		})
		/*window.requestAnimationFrame(this.drawNextFrame)*/
		window.onresize = this.windowresize
	},

	unmounted()
	{
		//Changer les state de tt ces trucs
		this.menu = true,
		this.game = false,
		this.configurate = false,
		this.waitingPlayer = false,
		this.disconnect = false,
		this.won = false,
		this.lost = false,
		this.disconnectGame = false,
		this.gameNotFoundState = false,
		this.spectate = false,
		this.isSpectating = false,
		this.initialised = false


		//Deconnecter la socket ?
		this.socket.disconnect()
	},

	methods: {


		disconnectPlayerWaiting()
		{
			this.socket.emit('disconnectWaiting')
			this.waitingPlayer = false
			this.menu = true
			this.configurate = false
		},
		//Event pour waiting room et game
		waitForPlayer() {
			this.configurate = false
			this.waitingPlayer = true
		},

		windowresize() {
			if (this.canvas)
			{
				this.canvaspos = this.canvas.getBoundingClientRect()
				this.canvasAbsoluteStart = this.canvaspos.top / window.innerHeight
				this.canvasAbsoluteEnd = this.canvaspos.bottom / window.innerHeight
				this.canvas.height = window.innerHeight * this.canvasAbsoluteSize
				this.canvas.width = window.innerWidth * this.canvasAbsoluteSize
				this.ball.mainCanvas.width = this.canvas.width
				this.ball.mainCanvas.height = this.canvas.height
				this.ball.radius = 0.008 * this.canvas.width
				if (this.isPlaying == true)
				{
					this.paddleLeft.mainCanvas.width = this.canvas.width
					this.paddleLeft.mainCanvas.height = this.canvas.height
					this.paddleLeft.setHeightDif()
					this.paddleRight.mainCanvas.width = this.canvas.width
					this.paddleRight.mainCanvas.height = this.canvas.height
					this.paddleRight.setHeightDif()
				}
			}
		},


		waitRoom()
		{
		},

		searchGame() {
			this.menu = false
			this.waitingPlayer = true
			this.socket.emit("searchGame", { userId : this.store.loggedUser?.id })
		},

		createGame()
		{
			this.socket.emit("createGame", { userId : this.store.loggedUser?.id })
		},


		//Fonctions de spectate
		spectateGame()
		{
			this.menu = false
			this.spectate = true
		},

		startSpectateGame(gameInstance : number, gameDifficulty : string, gameColor : string)
		{
			if (this.canvas)
			{
				this.difficulty = gameDifficulty
				this.ownPaddle = "left"
				this.ball.color = gameColor
				this.socket.emit("StartSpectating", { gameId : gameInstance })
				this.paddleLeft = new Paddle("canvas", "grey", 0.01 * this.canvas.width, true, this.difficulty)
				this.paddleRight = new Paddle("canvas", "grey", this.canvas.width - 0.01 * this.canvas.width, false, this.difficulty)
				this.spectate = false
				this.game = true
				this.isSpectating = true
			}
		},

		endSpectate()
		{
			this.game = false
			this.menu = true
			this.updateScore({p1 : 0, p2 : 0 })
		},

		spectateDisconnect()
		{
			this.game = false
			this.menu = true
			this.updateScore({p1 : 0, p2 : 0 })
		},



		configureGame(gameId : number)
		{
			this.gameId = gameId
			this.menu = false
			this.configurate = true
			this.waitingPlayer = false
		},

		configurateChoice(color : string, difficulty : string, score : number)
		{
			this.color = color
			this.difficulty = difficulty
			this.configurate = false
			this.waitingPlayer = true
			this.socket.emit('configurate', {gameId : this.gameId, color : this.color, difficulty : this.difficulty, score : score})
		},

		joinGame(playerPos : string, gameId : number, difficulty : string, color : string) {
			this.ownPaddle = playerPos
			this.gameId = gameId
			clearInterval(this.intervalId)
			this.waiting = false
			this.isPlaying = true
			this.difficulty = difficulty
			this.ball.color = color
		},

		alreadyGaming()
		{
			if (this.store)
				this.store.pushAlert("error", "You are already Gaming on another screen")
			this.waitingPlayer = false
			this.menu = true
		},

		//Event pour le déroulement de la partie
		updateBall( ballCenter : Point ) {
			if (this.isPlaying || this.isSpectating)
			{
				if (this.canvas)
				{
					this.ball.setxpos(ballCenter.x * this.canvas.width)
					this.ball.setypos(ballCenter.y * this.canvas.height)
				}
			}
		},

		updateOwnPadle(ownPaddle : PaddlePos)
		{
			if (this.isPlaying || this.isSpectating)
			{
				if (this.canvas)
				{
					if (this.ownPaddle === "left")
					{
						this.paddleLeft.setXpos(ownPaddle.centerPos.x * this.canvas.width)
						this.paddleLeft.setYpos(ownPaddle.centerPos.y * this.canvas.height)
					}
					else if (this.ownPaddle === "right")
					{
						this.paddleRight.setXpos(ownPaddle.centerPos.x * this.canvas.width)
						this.paddleRight.setYpos(ownPaddle.centerPos.y * this.canvas.height)
					}
				}
			}
		},

		updateOtherPaddle(otherPaddle : PaddlePos)
		{
			if (this.isPlaying || this.isSpectating)
			{
				if (this.canvas)
				{
					if (this.ownPaddle === "right")
					{
						this.paddleLeft.setXpos(otherPaddle.centerPos.x * this.canvas.width)
						this.paddleLeft.setYpos(otherPaddle.centerPos.y * this.canvas.height)
					}
					else if (this.ownPaddle === "left")
					{
						this.paddleRight.setXpos(otherPaddle.centerPos.x * this.canvas.width)
						this.paddleRight.setYpos(otherPaddle.centerPos.y * this.canvas.height)
					}
				}
			}
		},

		updateScore(score : Score) {
			if (this.leftScore?.textContent)
				this.leftScore.textContent = score.p1.toString()
			if (this.rightScore?.textContent)
				this.rightScore.textContent = score.p2.toString()
		},

		drawFrame()
		{
			if (this.isPlaying || this.isSpectating)
			{
				if (this.canvas)
					this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
				this.paddleRight.draw(0)
				this.paddleLeft.draw(0)
				this.ball.draw()
			}
		},

		drawNextFrame()
		{
			if (this.isPlaying || this.isSpectating)
			{
				if (this.canvas)
					this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
				this.ball.update(this.paddleLeft.getPaddlePos(), this.paddleRight.getPaddlePos())
				this.ball.draw()
				this.paddleLeft.draw(0)
				this.paddleRight.draw(0)
			}
			window.requestAnimationFrame(this.drawNextFrame)
		},

		handleWin()
		{
			this.game = false
			this.won = true
			this.isPlaying = false
			this.updateScore({p1 : 0, p2 : 0})
			if (this.canvas)
			{
				this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
			}
		},

		handleLoose()
		{
			this.game = false
			this.lost = true
			this.isPlaying = false
			this.updateScore({p1 : 0, p2 : 0})
			if (this.canvas)
			{
				this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
			}
		},

		//Event de gestion de deconnection

		playerDisconnect()
		{
			this.game = false
			this.isPlaying = false
			this.configurate = false
			this.waitingPlayer = false
			this.disconnect = true
		},

		playerDisconnectGame()
		{
			this.game = false
			this.isPlaying = false
			this.configurate = false
			this.waitingPlayer = false
			this.disconnect = false
			this.disconnectGame = true
		},

		returnToMenu()
		{
			this.disconnect = false
			this.menu = true
			this.game = false
			this.configurate = false
			this.waitingPlayer = false
			this.disconnect = false
			this.won = false
			this.lost = false
			this.disconnectGame = false
			this.gameNotFoundState = false
			this.spectate = false
			this.updateScore({p1 : 0, p2 : 0 })
			this.initialised = false
		},

		//Methode d'invitation
		creatorGameInvite(gameId : string)
		{
			this.socket.emit("startInvite", { gameId : gameId , userId : this.store.loggedUser?.id})
		},

		joinGameInvite(gameId : string)
		{
			this.socket.emit("joinInvite", { gameId : gameId , userId : this.store.loggedUser?.id})
		},

		waitPlayer2()
		{
			this.menu = false
			this.waitingPlayer = true
		},

		gameNotFound()
		{
			this.menu = false
			this.gameNotFoundState = true
			this.game = false
			this.waitingPlayer = false
		},

		joinedGameInvite(gameId : number)
		{
			this.gameId = gameId
			this.menu = false
			this.waitingPlayer = true
		}
	}
}

</script>