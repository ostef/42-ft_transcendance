
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
import { useStore } from "@/store";
import { ref } from "vue";
import axios from "axios";
import QRCodeVue3 from "qrcode-vue3";
import {logout} from "@/authentication";
import NonInteractiveAvatar from "@/components/NonInteractiveAvatar.vue";


const store = useStore();
// const { user } = storeToRefs (userStore);

const isEditing = ref("");

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
    const res = await axios.put("/user/avatar", fd);
    store.loggedUser.avatarFile = res.data.toString();
    // toggleChangePicture();
}

async function changeNickname() {
    await axios.put("user", { nickname: nickNameNew.value });
    store.loggedUser.nickname = nickNameNew.value;
    // toggleChangeNickname();
}

async function generate2faQrCode() {
    isChanging2fa.value = !isChanging2fa.value;
    const res = await axios.get("/auth/2fa/generate");
    if (res.status != 200)
        return;
    console.log(res.data);
    qrCode2fa.value = res.data.toString();

}

async function turnon2fa() {
    const res = await axios.post("/auth/2fa/turn-on", { code: code2fa.value });
    qrCode2fa.value = ""
  if (res.status == 200)
    store.loggedUser.has2FA = true;
  logout();


}

async function turnoff2fa() {
    const res = await axios.post("/auth/2fa/turn-off", { code: code2fa.value });
    if (res.status == 200)
      store.loggedUser.has2FA = false;
    logout();

}

// function toggleChangeNickname() {
//     isChangingNickname.value = !isChangingNickname.value;
// }
//
// function toggleChangePicture() {
//     isChangingPicture.value = !isChangingPicture.value;
// }

function onPictureSelectionChanged($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];

    if (!file)
        return;

    pictureNew.value = file;
}


</script>


<template>
    <div class="flex flex-col space-y-10 justify-center items-center" id="container">
        <div id="information" class="flex flex-row space-x-8  items-center">\
          <NonInteractiveAvatar :user="store?.loggedUser" class="w-24 h-24"/>
          <h2 class="text-3xl"> {{ store.loggedUser?.nickname }}</h2>
        </div>
      <div class="flex space-x-4">
          <input class="btn" type="radio" name="options" v-model="isEditing" value="picture" aria-label="Change Picture">
          <input class="btn" type="radio" name="options" v-model="isEditing" value="username" aria-label="Change Username">
          <input v-if="!store.loggedUser?.has2FA" class="btn btn-success " type="radio" name="options" v-model="isEditing" value="2fa-on" aria-label="Enable 2FA" @click="generate2faQrCode">
          <input v-else class="btn btn-error " type="radio" name="options" v-model="isEditing" value="2fa-off" aria-label="Disable 2FA">
      </div>
      <div>
         <div v-if="isEditing == 'picture'" class="input-group">
                    <input type="file" class="file-input file-input-bordered file-input-primary w-full max-w-xs" @change="onPictureSelectionChanged" accept="image/*" formenctype="multipart/form-data"/>
                    <button class="btn btn-success input-group-btn" @click="changePicture" :disabled="!pictureNew">Validate</button>
                    <button class="btn btn-error input-group-btn" @click="isEditing = ''">Cancel</button>
         </div>
         <div v-else-if="isEditing == 'username'" class="input-group">
                    <input type="text" v-model="nickNameNew" placeholder="New nickname" class="input input-bordered" />
                    <button class="btn btn-success input-group-btn" :disabled="nickNameNew.length == 0" @click="changeNickname">Validate</button>
                    <button class="btn btn-error input-group-btn" @click="isEditing = ''">Cancel</button>
         </div>
        <div v-else-if="isEditing == '2fa-on'" class="flex items-center space-x-8">
                    <img class="join-item" v-if="qrCode2fa != ''" :src="qrCode2fa" />
                    <div class="flex flex-col ">
                        <input type="text" v-model="code2fa" placeholder="Enter 2fa code" class="input input-bordered join-item" />
                        <div class="join">
                          <button class="btn btn-success join-item" :disabled="code2fa.length == 0" @click="turnon2fa">Validate</button>
                          <button class="btn btn-error join-item" @click="isEditing = ''">Cancel</button>
                        </div>
                    </div>
        </div>
        <div v-else-if="isEditing == '2fa-off'" class="input-group">
                    <input type="text" v-model="code2fa" placeholder="Enter 2fa code" class="input input-bordered" />
                    <button class="btn btn-success input-group-btn" :disabled="code2fa.length == 0" @click="turnoff2fa">Validate</button>
                    <button class="btn btn-error input-group-btn" @click="isEditing = ''">Cancel</button>
        </div>

      </div>


    </div>
</template>
