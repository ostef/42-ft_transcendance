import { createRouter, createWebHistory } from "vue-router"
import axios from "axios";

import { useStore } from "@/store";
import { connectChatSocket } from "@/chat";
import { fetchUserInfo, logout, isAuthenticated } from "@/authentication";

import HomeView from "@/views/Home.vue";
import ChatView from "@/views/Chat.vue";
import LoginView from "@/views/Login.vue";

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

router.beforeEach (async (to, from, next) => {
    const store = useStore ();

    const authenticated = await isAuthenticated ();

    if (to.name != "Login" && !authenticated)
    {
        console.log ("Not authenticated... Redirecting to login page");
        return next ({ name: "Login" });
    }

    if (authenticated)
    {
        try
        {
            await fetchUserInfo ();
            connectChatSocket ();
        }
        catch (err)
        {
            console.error ("Could not retrieve user info. Redirecting to login page");
            console.log (err);

            logout ();

            return next ({ name: "Login" });
        }
    }
    else
    {
        store.loggedUser = null;
    }

    return next ();
});

export default router;
