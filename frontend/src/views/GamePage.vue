<template>
		<div>
		<div class="leftbar"></div>
		<div class="rightbar"></div>
		<div class="navbar"></div>
		<div class="score">
			<div id="player-score">0</div>
			<div id="computer-score">0</div>
		</div>
		<canvas class="canvas" id="myCanvas"></canvas>
		</div>
</template>

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

<script  setup>


import { onMounted } from "vue"
import Ball from "../script/game/Ball.ts"
import Paddle from "../script/game/Paddle.ts"

let lastTime

let ball = null
let playerPaddle = null
let computerPaddle = null
let playerScoreElem = null
let computerScoreElem = null

let canvas = null
let ctx = null

let CanvasAbsoluteSize = 60 / 100
let CanvasAbsoluteStart = 20 / 100

onMounted(() => {


	

	canvas = document.querySelector("canvas")
	ctx = canvas.getContext("2d")

	//Il faut set les dimensions du canvas pour que le reste du code fonctionne
	canvas.height = window.innerHeight * CanvasAbsoluteSize
	canvas.width =  window.innerWidth * CanvasAbsoluteSize
	ball = new Ball("canvas", 100, 100, {x: 10 , y: 10}, "red", 8)
	playerPaddle = new Paddle("canvas", "white", 5, true)
	computerPaddle = new Paddle("canvas", "white", canvas.width - 5, false)
	playerScoreElem = document.getElementById("player-score")
	computerScoreElem = document.getElementById("computer-score")

	document.addEventListener("mousemove", e=> {
	playerPaddle.setYpos(e.y)
	playerPaddle.draw(0)
	})

	window.onresize = windowresize
	window.requestAnimationFrame(update)
})

function windowresize() 
{
	const ballPosAbsolute = ball.getypos() / canvas.height
	const ballXPosAbsolute = ball.getxpos() / canvas.width
	canvas.height = window.innerHeight * CanvasAbsoluteSize
	canvas.width =  window.innerWidth * CanvasAbsoluteSize
	playerPaddle.context = canvas.getContext("2d")
	computerPaddle.context = canvas.getContext("2d")
	ball.context = canvas.getContext("2d")
	ball.canvas = canvas
	playerPaddle.canvas = canvas
	computerPaddle.canvas = canvas
	//computerPaddle.setXpos(canvas.width - 15 + computerPaddle.getWidth() / 2)
	playerPaddle.setHeight(canvas.height / 7)
	computerPaddle.setHeight(canvas.height / 7)
	computerPaddle.setXpos(canvas.width - 5)

	//Mise à jour de la balle en absolue pour éviter des tricks en window resize
	ball.setypos(ballPosAbsolute * canvas.height)
	ball.setxpos(ballXPosAbsolute * canvas.width)
	//Todo Besoin de regler encore des bugs de resize pour la balle ou elle stuck en bas
}

function update(time) 
{

	if (lastTime != null)
	{
		const delta = time - lastTime
		ball.clear()
		computerPaddle.updatecomputer(ball.getypos())
		computerPaddle.draw(1)
		ball.update(delta, playerPaddle.getPaddlePos(), computerPaddle.getPaddlePos())
		//The next line is here to stop the animation frame to lower the position of
		//the paddle. Because the draw function does lower it for good reasons
		playerPaddle.setYpos(playerPaddle.getYpos() + window.innerHeight * CanvasAbsoluteStart)
		playerPaddle.draw(0)
		const hue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hue"))

		document.documentElement.style.setProperty("--hue", (hue + delta * 0.01).toString())
		if (isLose())
		{
			handleLose()
		}
	}
	lastTime = time
	window.requestAnimationFrame(update)
}

function isLose() 
{
	if (ball.getcenterpos().x + ball.radius >= canvas.width)
		return (1)

	if (ball.getcenterpos().x - ball.radius <= 1)
		return (1)
	return (0)
}


function handleLose() 
{

	if (ball.getcenterpos().x + ball.radius >= canvas.width)
	{
		if (playerScoreElem?.textContent)
			playerScoreElem.textContent = (parseInt(playerScoreElem.textContent) + 1).toString()
	}
	else 
	{
		if (computerScoreElem?.textContent)
			computerScoreElem.textContent = (parseInt(computerScoreElem.textContent) + 1).toString()
	}
	ball.reset()
	computerPaddle.reset()
}

</script>

