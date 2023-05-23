<template>
    <div>
    <div class="leftbar"></div>
    <div class="rightbar"></div>
    <div class="navbar"></div>
	<button class="startGame" @click="searchGame()"></button>
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
			delta : 15
        }
    },
    created () {
        console.log("Starting connection to websocket server")
        this.socket = io("http://" + window.location.hostname + ":3000/game", {
        transportOptions: {
            polling: { extraHeaders: { authorization: "Bearer " + localStorage.getItem ("token") } }},
        })

		//Todo Coder toutes les fonctions des listens

		//Events to connect
		this.socket.on("onConnection" , data => {
			console.log(data.id)
		})

		//Events to join waiting room or games
		this.socket.on("waitingMessage", data => {
			this.launchWaitRoom()
		})
		this.socket.on("foundGame", (playerPos, gameId) => {
			console.log("Found a game with game id : ", gameId)
			this.joinGame(playerPos, gameId)
		})




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
        
    },

	mounted() {
		console.log("mounted")
		this.canvas = document.querySelector("canvas")
		if (this.canvas)
		{
			console.log("mounted")
			this.context = this.canvas.getContext("2d")
			this.canvas.height = window.innerHeight * this.canvasAbsoluteSize
			this.canvas.width = window.innerWidth * this.canvasAbsoluteSize

			this.ball = new Ball("canvas", 100, 100, {x: 10 , y: 10}, "red", 10, this.delta)
			this.paddleLeft = new Paddle("canvas", "white", 5, true)
			this.paddleRight = new Paddle("canvas", "white", this.canvas.width - 5, false)
			this.leftScore = document.getElementById("player1-score")
			this.rightScore = document.getElementById("player2-score")
		}
		this.isPlaying = false

		


		document.addEventListener("mousemove", e => {
			let mouseHeight = 0
			if (this.isPlaying)
			{
				if (e.y <= window.innerHeight * this.canvasAbsoluteStart + this.paddleLeft.getHeight() / 2)
				{
					mouseHeight = this.paddleLeft.getHeight() / 2
					this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
					return
				}
				else if (e.y >= window.innerHeight - window.innerHeight * this.canvasAbsoluteStart - this.paddleLeft.getHeight() / 2)
				{
					if (this.canvas)
						mouseHeight = this.canvas.height - this.paddleLeft.getHeight() / 2
					this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
					return
				}
				mouseHeight = e.y - window.innerHeight * this.canvasAbsoluteStart
				console.log("mouseheight : ", mouseHeight)
				this.socket.emit("updatePaddle", { gameId : this.gameId, paddlePos : mouseHeight})
			}
		})
		/*window.requestAnimationFrame(this.drawNextFrame)*/
		window.onresize = this.windowresize

	},
	methods: {
		windowresize() {

		},

		//Event pour waiting room et game
		launchWaitRoom() {
			this.waiting = true

			//Todo waitroom avec des set interval ?
			console.log(this.intervalId)
			this.intervalId = setInterval(this.waitRoom.bind(this), 1000)
			console.log(this.intervalId)
		},

		waitRoom()
		{
			console.log("waiting for a game")
		},

		searchGame() {
			console.log("Canvas :", this.canvas?.width, this.canvas?.height)
			console.log("Window : ", window.innerWidth, window.innerHeight)
			this.socket.emit("searchGame", {canvas : {width : this.canvas?.width, height : this.canvas?.height}, window  : { width : window.innerWidth, height : window.innerHeight} })
		},
		
		joinGame(playerPos : string, gameId : number) {
			console.log("joined a game")
			this.ownPaddle = playerPos
			this.gameId = gameId
			clearInterval(this.intervalId)
			this.waiting = false
			this.isPlaying = true
		},

		//Event pour le déroulement de la partie
		updateBall( ballCenter : Point ) {
			this.ball.setxpos(ballCenter.x)
			this.ball.setypos(ballCenter.y)
		},

		updateOwnPadle(ownPaddle : PaddlePos) {
			if (this.ownPaddle === "left")
			{
				this.paddleLeft.setXpos(ownPaddle.centerPos.x)
				this.paddleLeft.setYpos(ownPaddle.centerPos.y)
			}
			else if (this.ownPaddle === "right")
			{
				this.paddleRight.setXpos(ownPaddle.centerPos.x)
				this.paddleRight.setYpos(ownPaddle.centerPos.y)
			}
		},

		updateOtherPaddle(otherPaddle : PaddlePos)
		{
			if (this.ownPaddle === "right")
			{
				this.paddleLeft.setXpos(otherPaddle.centerPos.x)
				this.paddleLeft.setYpos(otherPaddle.centerPos.y)
			}
			else if (this.ownPaddle === "left")
			{
				this.paddleRight.setXpos(otherPaddle.centerPos.x)
				this.paddleRight.setYpos(otherPaddle.centerPos.y)
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
			if (this.canvas)
				this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.ball.draw()
			this.paddleLeft.draw(0)
			this.paddleRight.draw(0)
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
		}
	}
}

</script>

<style>



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

.navbar {
position: absolute;
top : 0px;
height: 20%;
}

.startGame {
	position: absolute;
	top : 0px;
	height: 20%;
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