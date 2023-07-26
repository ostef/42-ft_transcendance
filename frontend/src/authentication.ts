import axios from "axios";
import { useStore } from "@/store";
import { connectChatSocket, disconnectChatSocket } from "@/chat";

export async function fetchUserInfo ()
{
    const store = useStore ();
    store.loggedUser = (await axios.get ("user/")).data;
}

export async function isAuthenticated (): Promise<boolean>
{
    const token = localStorage.getItem ("token");
    if (!token)
        return false;

    const res = await axios.get ("/auth/check-jwt");

    return res.data;
}

export async function is2FAAuthenticated (): Promise<boolean>
{
    const res = await axios.get ("/auth/2fa/check");

    return res.data;
}

export async function login (username: string, password: string)
{
    const res = await axios.post ("auth/login", { username: username, password: password });

    const token = res.data.access_token;
    localStorage.setItem ("token", token);
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

    // await fetchUserInfo ();
    // connectChatSocket ();
}

export async function login42 () {
    const loginpopup = window.open(
        "http://" + window + ":3000/auth/42",
        "Login",
        "width=600,height=600"
    );
    while (loginpopup && !loginpopup.closed) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }


    const token = document.cookie.split("=")[1];
    if (!token) throw new Error("Login using 42 failed");

        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        // await fetchUserInfo ();
        // connectChatSocket ();



}

export async function login2FA (code: string)
{
    const res = await axios.post ("auth/2fa/authenticate", { code: code });
    const token = res.data.access_token;
    localStorage.setItem ("token", token);
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

}



export function logout ()
{
    document.cookie = "";
    localStorage.removeItem ("token");
    delete axios.defaults.headers.common["Authorization"];

    disconnectChatSocket ();
    const store = useStore ();
    store.loggedUser = null;
}

