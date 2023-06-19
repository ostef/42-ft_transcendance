import { createRouter, createWebHistory } from "vue-router"
import HomeView from "@/views/Home.vue";
import ChatView from "@/views/Chat.vue";
import LoginView from "@/views/Login.vue";
import axios from "axios";

import { useUserStore } from "@/stores/user";
import { fetchUserInfo, logout, isAuthenticated } from "@/authentication";

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
    const userStore = useUserStore ();

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
        userStore.user = null;
    }

    return next ();
});

export default router;
