import "./assets/app.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { Icon } from "@iconify/vue";

import { Socket, io } from "socket.io-client";
import axios from "axios";
import VueAxios from "vue-axios";
import router from "@/router";
import { useStore } from "@/store";
import { logout } from "@/authentication";

import App from "@/App.vue";

export function catchError (err: any)
{
    const store = useStore ();

    if (axios.isAxiosError (err))
    {
        let msg = "";
        if (err.response)
            msg = err.response.data.message;
        else
            msg = err.message;

        if (msg == "Unauthorized" || msg == "Token expired")
        {
            msg += ", redirecting to login page";
            logout ();
            router.replace ("/login");
        }

        store.pushAlert ("error", msg);

        return false;
    }
    else if (err instanceof Error)
    {
        store.pushAlert ("error", err.message);

        return false;
    }

    return true;
}

const app = createApp (App);

app.component ("iconify-icon", Icon)

app.use (createPinia ());
app.use (VueAxios, axios);
app.use (router);

axios.defaults.baseURL = "http://" + location.hostname + ":3000";
axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem ("token");

app.mount ("#app");
