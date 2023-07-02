
<!--<script lang="ts">-->
<!--export default {-->
<!--    name: "Settings",-->
<!--    computed: {-->
<!--        isUsernameNewEmpty() {-->
<!--            return this.usernameNew == '';-->
<!--        }-->
<!--    },-->
<!--}-->
<!--</script>-->


<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import axios from "axios";
import QRCodeVue3 from "qrcode-vue3";


const userStore = useUserStore();
const { user } = storeToRefs (userStore);

const isChangingNickname = ref(false);
const isChangingPicture = ref(false);
const isChanging2fa = ref(false);
const nickNameNew = ref("");
const pictureNew = ref<File | null>(null);
const qrCode2fa = ref("");
const code2fa = ref("");
async function changePicture()
{
    const fd = new FormData();
    fd.append("avatar", pictureNew.value);
    const res = await axios.post("/user/avatar", fd);
    userStore.user.avatarFile = res.data.toString();
    toggleChangePicture();
}

async function changeNickname() {
    await axios.post("/user/nickname", { value: nickNameNew.value });
    userStore.user.nickname = nickNameNew.value;
    toggleChangeNickname();
}

async function change2fa() {
    isChanging2fa.value = !isChanging2fa.value;
    const res = await axios.get("/auth/2fa/generate");
    if (res.status != 200)
        return;
    console.log(res.data);
    qrCode2fa.value = res.data.toString();

}

async function turon2fa() {
    const res = await axios.post("/auth/2fa/turn-on", { code: code2fa.value });
    if (res.status != 200)
        return;
    console.log(res.data);
    qrCode2fa.value = ""

}

function toggleChangeNickname() {
    isChangingNickname.value = !isChangingNickname.value;
}

function toggleChangePicture() {
    isChangingPicture.value = !isChangingPicture.value;
}

function onPictureSelectionChanged($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];

    if (!file)
        return;

    pictureNew.value = file;
}




</script>


<template>
    <div class="flex flex-col space-y-10 justify-center items-center" id="container">
        <div id="information" class="flex flex-row space-x-8  items-center">
            <div class="h-24 w-24 btn  btn-circle overflow-hidden grid">
                <img v-if="userStore.user.avatarFile!= undefined" :src="userStore.user.avatarFile" />
            </div>
                <h2 class="text-3xl">  {{ userStore.user.nickname }}</h2>
        </div>
        <div class="flex  space-x-4" >
            <div>
                <button v-if="!isChangingPicture" class="btn btn-primary nput-group-btn" @click="toggleChangePicture">Change Picture</button>
                <div v-else class="input-group">
                    <input type="file" class="file-input file-input-bordered file-input-primary w-full max-w-xs" @change="onPictureSelectionChanged" accept="image/*" formenctype="multipart/form-data"/>
                    <button class="btn btn-success input-group-btn" @click="changePicture" :disabled="!pictureNew">Validate</button>
                    <button class="btn btn-error input-group-btn" @click="toggleChangePicture">Cancel</button>
                </div>

            </div>3
            <div>
                <button v-if="!isChangingNickname" class="btn btn-primary input-group-btn" @click="toggleChangeNickname">Change Nickname</button>
                <div v-else class="input-group">
                    <input type="text" v-model="nickNameNew" placeholder="New nickname" class="input input-bordered" />
                    <button class="btn btn-success input-group-btn" :disabled="nickNameNew.length == 0" @click="changeNickname">Validate</button>
                    <button class="btn btn-error input-group-btn" @click="toggleChangeNickname">Cancel</button>
                </div>
            </div>
        </div>
        <div>
            <label class="toggle-label">
                <span>2FA </span>
                <input type="checkbox" class="toggle toggle-primary" :checked="userStore.user.has2Fa" @click="change2fa"/>
                <div v-if="isChanging2fa" class="input-group">
                    <img :src="qrCode2fa" />
                    <QRCodeVue3 v-if="qrCode2fa != ''" :value="qrCode2fa" />
                    <input type="text" v-model="code2fa" placeholder="Enter 2fa code" class="input input-bordered" />
                    <button class="btn btn-success input-group-btn" :disabled="code2fa.length == 0" @click="turon2fa">Validate</button>
                    <button class="btn btn-error input-group-btn" @click="">Cancel</button>
                </div>
            </label>
        </div>
    </div>
</template>


<style scoped>

</style>