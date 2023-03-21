<template>

	<div>
		<div class="score">
			<div id="player-score">1000</div>
			<div id="computer-score">50</div>
		</div>
		<div class="ball" id="ball"></div>
		<div class="paddle left" id="player-paddle"></div>
		<div class="paddle right" id="computer-paddle"></div>
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
	margin: 0;
	background-color: var(--background-color);
}

.paddle {
	--position : 50;


	position: absolute;
	background-color: var(--foreground-color);
	top: calc(var(--position) * 1vh);
	transform: translateY(-50%);
	width: 1vh;
	height: 10vh;
}

.paddle.left {
	left: 1vw;
}

.paddle.right {
	right: 1vw;
}

.ball {

	--x: 50;
	--y: 50;


	position: absolute;
	background-color: var(--foreground-color);
	left: calc(var(--x) * 1vw);
	top: calc(var(--y) * 1vh);
	border-radius: 50%;
	transform: translate(-50%);
	width: 2.5vh;
	height: 2.5vh;
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

onMounted(() => {
	ball = new Ball(document.getElementById("ball"))
	playerPaddle = new Paddle(document.getElementById("player-paddle"))
	computerPaddle = new Paddle(document.getElementById("computer-paddle"))
	playerScoreElem = document.getElementById("player-score")
	computerScoreElem = document.getElementById("computer-score")

	document.addEventListener("mousemove", e=> {
	playerPaddle.position = e.y / window.innerHeight * 100
	})
	window.requestAnimationFrame(update)
})

function update(time) 
{

	if (lastTime != null)
	{
		const delta = time - lastTime
		ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()])
		computerPaddle.update(delta, ball.y)
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
	const rect = ball.rect()
	return (rect.right >= window.innerWidth || rect.left <= 0)
}


function handleLose() 
{
	const rect = ball.rect()

	if (rect.right >= window.innerWidth)
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

