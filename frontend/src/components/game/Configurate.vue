<script lang = "ts">

export default {

    data () {
        return {
            color : "default" as string,
            difficulty : "default" as string
        }
    },
    methods: {

        changeDifficulty(newDifficulty : string)
        {
            this.difficulty = newDifficulty;
        },
        changeColor(newColor : string)
        {
            this.color = newColor
        },
        emitConfig()
        {
            //console.log("The difficulty chosen is " + this.difficulty)
            let color = this.color
            let difficulty = this.difficulty
            this.$emit('on-config', color, difficulty)
        }
    }
}

</script>


<template>
    <div class="flex content-center justify-center">
        <div class="p-8 rounded-lg shadow-2xl m-14 bg-base-600" >
            <div class="flex flex-row p-4 justify-center">
                <h1 class="text-lg w-2/5 mr-4 font-bold">Choose difficulty</h1>
                <div class="form-control w-1/5">
                    <label class="label cursor-pointer mr-4">
                        <span class="label-text text-lg fontwin-bold mr-4">Default</span>
                        <input @change="changeDifficulty('default')" type="radio" name="radio-2" class="radio checked:bg-red-500" checked />
                    </label>
                </div>
                <div class="form-control w-1/5">
                    <label class="label cursor-pointer mr-4">
                        <span class="label-text text-lg fontwin-bold mr-4">Easy</span>
                        <input @change="changeDifficulty('easy')" type="radio" name="radio-2" class="radio checked:bg-red-500" />
                    </label>
                </div>
                <div class="form-control w-1/5">
                <label class="label cursor-pointer mr-4">
                    <span class="label-text text-lg fontwin-bold mr-4">Medium</span>
                    <input @change="changeDifficulty('medium')" type="radio" name="radio-2" class="radio checked:bg-red-500" />
                </label>
                </div>
                <div class="form-control w-1/5">
                <label class="label cursor-pointer mr-4">
                    <span class="label-text text-lg fontwin-bold mr-4">Hard</span>
                    <input @change="changeDifficulty('hard')" type="radio" name="radio-2" class="radio checked:bg-red-500" />
                </label>
                </div>
            </div>

            <div class="flex flex-row p-4 justify-center">
                <h1 class="text-lg w-2/5 mr-4 font-bold">Choose Ball Color</h1>
                <div class="form-control w-1/5">
                    <label class="label cursor-pointer mr-4">
                        <span class="label-text text-lg fontwin-bold mr-4">Default</span>
                        <input @change="changeColor('default')" type="radio" name="radio-10" class="radio checked:bg-red-500" checked />
                    </label>
                </div>
                <div class="form-control w-1/5">
                    <label class="label cursor-pointer mr-4">
                        <span class="label-text text-lg fontwin-bold mr-4">Green</span>
                        <input @change="changeColor('green')" type="radio" name="radio-10" class="radio checked:bg-red-500" />
                    </label>
                </div>
                <div class="form-control w-1/5">
                <label class="label cursor-pointer mr-4">
                    <span class="label-text text-lg fontwin-bold mr-4">Red</span>
                    <input @change="changeColor('red')" type="radio" name="radio-10" class="radio checked:bg-red-500" />
                </label>
                </div>
                <div class="form-control w-1/5">
                <label class="label cursor-pointer mr-4">
                    <span class="label-text text-lg fontwin-bold mr-4">Black</span>
                    <input @change="changeColor('black')" type="radio" name="radio-10" class="radio checked:bg-red-500" />
                </label>
                </div>
            </div>
            <button class="btn normal-case mt-4" @click="emitConfig()">Validate</button>
            <button class="btn normal-case mt-4 ml-5" @click="$emit('disconnect')">Quit</button>
        </div>
    </div>
</template>