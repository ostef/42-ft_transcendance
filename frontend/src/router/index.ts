import { createRouter, createWebHistory } from "vue-router"
import ChatView from "../views/Chat.vue";
import

const router = createRouter ({
    history: createWebHistory (import.meta.env.BASE_URL),
    routes: [
        {
            path: "/chat",
            name: "chat",
            component: ChatView
        },
    ]
});

export default router;
