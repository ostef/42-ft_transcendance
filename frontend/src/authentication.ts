import axios from "axios";
import { useUserStore } from "@/stores/user";
import { connectChatSocket, disconnectChatSocket } from "@/chat";

export async function login (username: string, password: string)
{
    const res = await axios.post ("auth/login", { username: username, password: password });

    const token = res.data.access_token;
    localStorage.setItem ("token", token);
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

    await fetchUserInfo ();
    connectChatSocket ();
}

export function logout ()
{
    localStorage.removeItem ("token");
    delete axios.defaults.headers.common["Authorization"];

    disconnectChatSocket ();
    const userStore = useUserStore ();
    userStore.user = null;
}

export async function fetchUserInfo ()
{
    const userStore = useUserStore ();
    userStore.user = (await axios.get ("user/")).data;
}

export async function isAuthenticated (): Promise<boolean>
{
    const token = localStorage.getItem ("token");
    if (!token)
        return false;

    const res = await axios.get ("/auth/check-jwt");

    return res.data;
}
