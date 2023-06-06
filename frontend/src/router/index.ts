import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/Home.vue";
import ChatView from "../views/Chat.vue";
import LoginView from "../views/Login.vue";
import axios from "axios";

const router = createRouter ({
    history: createWebHistory (import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "Home",
            component: HomeView
        },
        {
            path: "/login",
            name: "Login",
            component: LoginView
        },
        {
            path: "/chat",
            name: "Chat",
            component: ChatView
        },
    ]
});

async function getAuthenticationStatus (): Promise<boolean>
{
    const token = localStorage.getItem ("token");
    if (token)
        return false;

    const res = await axios.get ("/auth/check-jwt", { headers: { Authorization: "Bearer " + token } });

    return res.data;
}

router.beforeEach ((to, from, next) => {
    getAuthenticationStatus ().then (authenticated =>
    {
        if (to.name != "Login" && !authenticated)
        {
            console.log ("Not authenticated... Redirecting to login page");
            return next ({ name: "Login" });
        }

        return next ();
    });
});

export default router;
