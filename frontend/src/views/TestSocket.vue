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

<script lang="ts">

import io from "socket.io-client";
import Socket from "socket.io-client"

export default {
    name : 'TestSocket',
    components : {
    },
    data () {
        return {
        }
    },
    created () {
        console.log("Starting connection to websocket server")
        this.socketInstance = io("http://localhost:5432")
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