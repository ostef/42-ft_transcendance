<template>
  <div id="channels-panel">
    <div id="channels">
      <button
        v-for="(chan, index) in channels"
        class="channel-entry"
        @click="changeCurrentChannel(index)"
      >
        {{ chan.name }}
      </button>
    </div>
  </div>

  <div id="chat-panel">
    <div id="channel-header">
      <b><em>#</em></b> {{ channels[channelIndex].name }}<br />
      <small
        ><i>{{ channels[channelIndex].description }}</i></small
      >
    </div>
    <div id="chat-messages">
      <div
        v-for="msg in loadedMessages"
        :class="msg.senderId == 0 ? 'message mine' : 'message theirs'"
      >
        <button class="message-sender">
          <img
            :src="getUserProfilePictureURL(msg.senderId)"
            alt="Profile picture"
          />
        </button>
        <div class="message-text">
          {{ msg.content }}
        </div>
      </div>
    </div>

    <form id="chat-input">
      <input
        type="text"
        name="input-message"
        v-model="inputMessage"
        placeholder="Write something"
      />
      <button type="button" @click="sendMessage()">Send</button>
    </form>
  </div>

  <div id="users-panel">
    <div id="users">
      <button v-for="(user, index) in usersInChannel" class="user-entry">
        <div class="user-picture">
          <img :src="user.profilePictureURL" alt="Profile picture" />
        </div>

        {{ user.username }} 👑
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { io } from "socket.io-client";
import ProfileDropdown from "../components/ProfileDropdown.vue";
import store from "../plugins/store";

export default {
  name: "Chat.vue",
  data() {
    return {
      inputMessage: "",
      channelIndex: 0,
    };
  },

  computed: {
    socket: {
      get(): any {
        return store.getters.getChatSocket;
      },

      set(socket: unknown) {
        store.commit("setChatSocket", socket);
      },
    },

    loadedMessages: {
      get(): any {
        return store.getters.getLoadedMessages;
      },
    },

    channels: {
      get(): any {
        return store.getters.getChannels;
      },
    },

    usersInChannel: {
      get(): any {
        return store.getters.getUsersInChannel;
      },
    },
  },

  created() {
    this.socket = io("http://" + window.location.hostname + ":3000", {
      transportOptions: {
        polling: {
          cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
          },
        },
      },
      withCredentials: true,
    });
    this.socket.on("connect", () => {
      console.log("Connected to chat server");
    });
    this.socket.on("connect_error", (err: any) => {
      console.log("Error connecting to chat server: " + err);
    });
  },

  methods: {
    sendMessage(): void {
      if (this.inputMessage.length > 0) {
        this.socket.emit("newMessage", {
          date: new Date(),
          content: this.inputMessage,
        });
        this.inputMessage = "";
      }
    },

    loadMessagesFromChannel(): void {},

    loadUsersInChannel(): void {},

    changeCurrentChannel(index: number): void {
      this.channelIndex = index;
      this.loadMessagesFromChannel();
      this.loadUsersInChannel();
    },

    getUserProfilePictureURL(id: number): string {
      const index = this.usersInChannel.findIndex((val) => val.id == id);
      if (index == -1) return "";

      return this.usersInChannel[index].profilePictureURL;
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#channels-panel {
  position: absolute;
  left: 0;
  right: 80%;
  top: 0;
  bottom: 0;
  background: blue;
  border-radius: 15px;
  margin: 5px;
  padding: 5px;
  overflow: hidden;
  display: grid;
}

#channels {
  padding: 5px;
  overflow: scroll;
}

#chat-panel {
  position: absolute;
  left: 20%;
  right: 20%;
  top: 0;
  bottom: 0;
  background: green;
  border-radius: 15px;
  margin: 5px;
  display: grid;
  overflow: hidden;
}

#users-panel {
  overflow: hidden;
  position: absolute;
  left: 80%;
  right: 0;
  top: 0;
  bottom: 0;
  background: red;
  border-radius: 15px;
  margin: 5px;
  display: grid;
}

#users {
  padding: 5px;
}

.channel-entry {
  padding: 10px;
  width: 100%;
  height: 64px;
  margin-top: 2px;
  margin-bottom: 2px;
  overflow: hidden;
}

.user-entry {
  padding: 10px;
  width: 100%;
  height: 64px;
  margin-top: 2px;
  margin-bottom: 2px;
  overflow: hidden;
}

#channel-header {
  padding: 15px;
  padding-left: 25px;
  text-align: left;
  font-size: large;
}

#chat-messages {
  /* background: rgba(209, 124, 209, 0.933); */
  overflow: scroll;
  display: grid;
  padding: 10px;
}

.message {
  margin: 10px;
  /* background: white; */
}

.message-sender {
  background: lime;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  float: left;
  overflow: hidden;
}

.message-sender img {
  width: 100%;
}

.message-text {
  background: tomato;
  border-radius: 20px;
  margin-left: 10px;
  margin-right: 10px;
  padding: 12px;
  float: left;
  max-width: 40%;
  overflow: hidden;
  white-space: pre-line;
}

.message.mine .message-sender {
  float: right;
}

.message.mine .message-text {
  background: blue;
  float: right;
}

#chat-input {
  background: rgb(5, 88, 40);
  padding: 20px;
}

#chat-input input {
  border: 1px solid #555;
  width: 60%;
  padding: 10px;
  margin-right: 10px;
  border-radius: 15px;
}

.user-picture {
  background: lime;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  float: left;
  overflow: hidden;
}

.user-picture img {
  width: 100%;
}
</style>
