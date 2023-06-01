<script setup lang="ts">

defineProps ({
    username: String,
    picture: String,
    online: Boolean,
    left: Boolean,
});

</script>

<template>
    <div class="dropdown flex" :class="left ? 'dropdown-left' : 'dropdown-right'" >
        <label tabindex="0" class="avatar" :class="online ? 'online' : 'offline'">
            <div class="h-12 w-12 btn btn-circle overflow-hidden">
                <img :src="picture" />
            </div>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content w-40 m-2 shadow rounded bg-base-300">
            <li><a>Add Friend</a></li>
            <li><a>Invite To Play</a></li>
            <li><a>See User Profile</a></li>
            <li><a class="bg-accent hover:bg-accent-focus">Block User</a></li>
        </ul>
    </div>
</template>
