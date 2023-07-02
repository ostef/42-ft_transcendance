import axios from "axios";
import { useUserStore } from "@/stores/user";

export async function login (username: string, password: string)
{
    const res = await axios.post ("auth/login", { username: username, password: password });

    const token = res.data.access_token;
    localStorage.setItem ("token", token);
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

    await updateUserInfo ();
}

export async function login42 () {
    const loginpopup = window.open(
        "http://localhost:3000/auth/42",
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
        await updateUserInfo();



}



export function logout ()
{
    document.cookie = "";
    localStorage.removeItem ("token");
    delete axios.defaults.headers.common["Authorization"];

    const userStore = useUserStore ();
    userStore.user = null;
}

export async function updateUserInfo ()
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
