<script setup lang="ts">

import { computed } from "vue";

import { useStore } from "@/store";
import { leaveChannel } from "@/chat";

import UserSelectionList from "./UserSelectionList.vue";

const store = useStore ();

const usersWithoutMe = computed (() => store.users.filter (val => val.id != store.loggedUser?.id));

</script>

<template>
    <input type="checkbox" id="leaveChannelOwnerModal" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box w-xs h-lg grid">
            <div class="block">
                <label class="float-right btn rounded-full" for="leaveChannelOwnerModal">
                    <iconify-icon class="w-4 h-4" icon="gg:close" />
                </label>

                <h3 class="text-lg font-bold select-none">Select New Channel Owner</h3>
            </div>

            <div class="h-lg">
                <UserSelectionList :users="usersWithoutMe" @on-select="(u) => leaveChannel (u.id)"/>
            </div>
        </div>
    </div>
</template>
