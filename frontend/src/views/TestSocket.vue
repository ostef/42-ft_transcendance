<template>
    <div>
    <div class="leftbar"></div>
    <div class="rightbar"></div>
    <div class="navbar2"></div>
	<button class="btn normal-case" @click="searchGame()">Search Game</button>
	<button class="btn normal-case" @click="createGame()">Create Game</button>
    <div class="score">
        <div id="player1-score">0</div>
        <div id="player2-score">0</div>
    </div>

    <canvas class="canvas" id="myCanvas"></canvas>
    </div>
</template>

<script lang="ts">

import io from "socket.io-client";
import Socket from "socket.io-client"
import { defineComponent } from "vue";
import Ball from "../script/game/Ball"
import Paddle from "../script/game/Paddle"
import App from "../App.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from 'pinia';

//Todo faire des fichiers de types
type Point = {x: number; y: number}
type Segment = { A: Point; B : Point}
type PaddlePos = {height : number, width: number, centerPos : {x : number, y : number}, front : Segment}
type Score =  {p1 : number, p2 : number}

export default {
    name : 'TestSocket',
    components : {
    },
    data () {
        return {
			socket : {} as ReturnType<typeof io>,
			context : {} as CanvasRenderingContext2D | null,
			ball :  {} as Ball,
			paddleLeft : {} as Paddle,
			paddleRight : {} as Paddle,
			leftScore : {} as HTMLElement | null,
			rightScore : {} as HTMLElement | null,
			canvas : {} as HTMLCanvasElement | null,
			canvasAbsoluteSize : 60/100,
			canvasAbsoluteStart : 20/100,
			ownPaddle : "",
			gameId : 0,
			waiting : false as boolean,
			isPlaying : false as boolean,
			intervalId : {} as ReturnType<typeof setInterval>,
			delta : 15,
			difficulty : 1 as number,
			inviteId : "" as any,
			userStore : null
        }
    },
    created () {
        console.log("Starting connection to websocket server")
        this.socket = io("http://" + window.location.hostname + ":3000/game", 
			
		)

		//Todo Coder toutes les fonctions des listens

		//Events to connect
		this.socket.on("onConnection" , data => {
			console.log(data.id)
		})

		//Events to join waiting room or games
		this.socket.on("waitingMessage", data => {
			//this.launchWaitRoom()
		})
		this.socket.on("foundGame", (playerPos, gameId, difficulty, color) => {
			console.log("Found a game with game id : ", gameId)
			if (playerPos === "right")
			{
				if (this.canvas)
				{
					this.paddleLeft = new Paddle("canvas", "black", 5, true, difficulty)
					this.paddleRight = new Paddle("canvas", "black", this.canvas.width - 5, false, difficulty)
				}
			}
			console.log("the color is : " + color)
			this.joinGame(playerPos, gameId, difficulty, color)
		})
		this.socket.on("configurateGame", (gameId) => {
			this.configurateGame(gameId)
			//Todo Coder le configurate game et le front pour que ca affiche le component configurate
		})
		/*this.socket.on("chooseDifficulty", (gameId) => {
			console.log("choosing a difficulty")
			this.chooseDifficulty(gameId)
		})
		this.socket.on("chooseColor", (gameId) => {
			console.log("choosing a color")
			this.chooseColor(gameId)
		})*/




		//Game events on updtaing padddle, ball and score
		this.socket.on("ballUpdate", data => {
			this.updateBall(data)
		})
		this.socket.on("ownPaddle", data => {
			this.updateOwnPadle(data)
		})
		this.socket.on("otherPaddle", data => {
			this.updateOtherPaddle(data)
			this.drawFrame()
		})
		this.socket.on("score", data => {
			this.updateScore(data)
		})
        

		//Game events for the end of the game
		this.socket.on("winGame", data => {
			console.log("Won the game")
			this.handleWin()
		})
		this.socket.on("looseGame", data => {
			console.log("Lost the game")
			this.handleLoose()
		})

		//Event d'invitation
		this.socket.on("waitinPlayerInvite", data => {
			console.log("Waiting for the invited player")
			this.waitPlayer2()
		}) 
		this.socket.on("gameNotFound", data => {
			console.log("GameNotFound")
			this.gameNotFound()
		})
		this.socket.on("joinedGameInvite", data => {
			console.log("Joined a game in wich i was invited")
			this.joinedGameInvite(data)
		})
		//Todo : Coder la recpetion d'event de deconnexion pour stop la game
    },

	mounted() {
		console.log("mounted")
		this.inviteId = this.$route.params.id
		this.userStore = useUserStore ();
		console.log(this.userStore.user.id)
		this.canvas = document.querySelector("canvas")
		if (this.canvas)
		{
			this.context = this.canvas.getContext("2d")
			this.canvas.height = window.innerHeight * this.canvasAbsoluteSize
			this.canvas.width = window.innerWidth * this.canvasAbsoluteSize

			this.ball = new Ball("canvas", 100, 100, {x: 10 , y: 10}, "red", 0.008 * this.canvas.width, this.delta)
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
				if (e.y <= window.innerHeight * this.canvasAbsoluteStart + this.paddleLeft.getHeight() / 2)
				{
					mouseHeight = (this.paddleLeft.getHeight() / 2) / this.canvas.height
					this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
					return
				}
				else if (e.y >= window.innerHeight - window.innerHeight * this.canvasAbsoluteStart - this.paddleLeft.getHeight() / 2)
				{
					if (this.canvas)
						mouseHeight = (this.canvas.height - this.paddleLeft.getHeight() / 2) / this.canvas.height
					this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
					return
				}
				mouseHeight = (e.y - window.innerHeight * this.canvasAbsoluteStart) / this.canvas.height
				this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
			}
		})
		/*window.requestAnimationFrame(this.drawNextFrame)*/
		window.onresize = this.windowresize



	},
	methods: {
		
		//Event pour waiting room et game
		launchWaitRoom() {
			this.waiting = true
			//Todo est-ce que c'est toujours utile ?
			this.intervalId = setInterval(this.waitRoom.bind(this), 1000)
		},
		
		windowresize() {
			this.canvas.height = window.innerHeight * this.canvasAbsoluteSize
			this.canvas.width = window.innerWidth * this.canvasAbsoluteSize
			this.ball.mainCanvas.width = this.canvas.width
			this.ball.mainCanvas.height = this.canvas.height
			this.paddleLeft.mainCanvas.width = this.canvas.width
			this.paddleLeft.mainCanvas.height = this.canvas.height
			this.paddleRight.mainCanvas.width = this.canvas.width
			this.paddleRight.mainCanvas.height = this.canvas.height
		},


		waitRoom()
		{
			console.log("waiting for a game")
		},

		searchGame() {
			this.socket.emit("searchGame", {canvas : {width : this.canvas?.width, height : this.canvas?.height}, window  : { width : window.innerWidth, height : window.innerHeight} })
		},

		createGame()
		{
			console.log("creating a Game")
			this.socket.emit("createGame", {canvas : {width : this.canvas?.width, height : this.canvas?.height}, window  : { width : window.innerWidth, height : window.innerHeight} })
		},

		chooseDifficulty(gameId : number)
		{
			this.gameId = gameId
			//Todo Doit attendre une difficulty du joueur et créer les paddle en fonction
			//et emit au serveur
			if (this.canvas)
			{
				this.paddleLeft = new Paddle("canvas", "black", 0.01 * this.canvas.width, true, 1)
				this.paddleRight = new Paddle("canvas", "black", this.canvas.width - 0.01 * this.canvas.width, false, 1)
			}
			this.socket.emit("difficultyChoice", {gameId : this.gameId, difficulty : 1})
		},

		chooseColor(gameId : number)
		{
			//Todo : choisir la color en front et l'envoyer au back
			this.socket.emit("addColor", {gameId : this.gameId, color : "green"})
		},
		
		joinGame(playerPos : string, gameId : number, difficulty : number, color : string) {
			console.log("joined a game")
			this.ownPaddle = playerPos
			this.gameId = gameId
			clearInterval(this.intervalId)
			this.waiting = false
			this.isPlaying = true
			this.difficulty = difficulty
			this.ball.color = color
			console.log("useId is : " + this.userStore.user.id)
			this.socket.emit("userId", {gameId : this.gameId, userId : this.userStore.user.id})
		},

		//Event pour le déroulement de la partie
		updateBall( ballCenter : Point ) {
			if (this.isPlaying)
			{
				this.ball.setxpos(ballCenter.x * this.canvas.width)
				this.ball.setypos(ballCenter.y * this.canvas.height)
			}
		},

		updateOwnPadle(ownPaddle : PaddlePos) 
		{
			if (this.isPlaying)
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
		},

		updateOtherPaddle(otherPaddle : PaddlePos)
		{
			if (this.isPlaying)
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
		},

		updateScore(score : Score) {
			if (this.leftScore?.textContent)
				this.leftScore.textContent = score.p1.toString()
			if (this.rightScore?.textContent)
				this.rightScore.textContent = score.p2.toString()
		},

		drawFrame()
		{
			if (this.isPlaying)
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
			if (this.isPlaying)
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
			//Todo Coder la partie ou la page nous affiche que l'on a gagné
			this.isPlaying = false
			if (this.canvas)
			{
				this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
			}
		},

		handleLoose()
		{
			//Todo Coder la partie ou la page nous affiche la défaite
			this.isPlaying = false
			if (this.canvas)
			{
				this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
			}
		},

		//Methode d'invitation
		creatorGameInvite(gameId : string)
		{
			this.socket.emit("startInvite", {instanceId : gameId, canvas : {width : this.canvas?.width, height : this.canvas?.height}, 
			windonw : {width : window.innerWidth, height : window.innerHeight}})
		},

		joinGameInvite(gameId : string)
		{
			this.socket.emit("joinInvite", gameId)
		},

		waitPlayer2()
		{
			//Todo : coder en front un ecran de waiting
		},

		gameNotFound()
		{
			//Todo : coder un game not found pour un instance id de merde
		},

		joinedGameInvite(gameId : number)
		{
			this.gameId = gameId
			//Todo : coder la partie front pour annoncer que l'on attend que le createur de partie finisse de configurer
		}
	}
}

</script>

<style scoped>

*, *::after, *::before {
box-sizing: border-box;
}

:root {
--hue: 200;
--saturation: 50%;
--foreground-color: hsl(var(--hue), var(--saturation), 75%);
--background-color: hsl(var(--hue), var(--saturation), 20%);
}

body {
position: relative;
margin: 0;
background-color: var(--background-color);
}

.canvas {
position: absolute;
border: 5px solid;
top: 20%;
left: 20%;
width: 60%;
height: 60%;
}

.leftbar {
position: absolute;
left: 0px;
width: 20%;
}

.rightbar {
position: absolute;
right: 0px;
width: 20%;
}

.navbar2 {
position: absolute;
top : 0px;
height: 20%;
}

.searchGame {
	position: absolute;
	top : 0px;
	height: 20%;
	left : 20%
}

.createGame {
	position: absolute;
	top : 0px;
	height: 20%;
	left : 70%
}

.score {
display: flex;
justify-content: center;
font-weight: bold;
font-size: 7vh;
color: var(--foreground-color);
}

.score > * {
flex-grow: 1;
flex-basis: 0;
padding: 0 2vh;
margin: 1vh 0;
opacity: .5;
}

.score > :first-child {
text-align: right;
border-right: .5vh solid var(--foreground-color);
}

</style>