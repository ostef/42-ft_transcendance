import * as VueRouter from "vue-router";

import Login from "../views/Login.vue";
import Profile from "../views/Profile.vue";
import Chat from "../views/Chat.vue";
import store from "./store";
import App from "../App.vue";
import cookie from "cookie";
import { inject } from "vue";
import Setting from "../views/Setting.vue";
import Debug from "../views/Debug.vue";
// import  VueCookies from "vue-cookies";

const routes: VueRouter.RouteRecordRaw[] = [
  {
    path: "/",
    redirect: {
      name: "profile",
    },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/profile",
    name: "myprofile",
    component: Profile,
  },
  //profile other users
  {
    path: "/profile/:username?",
    name: "profile",
    component: Profile,
  },
  {
    path: "/settings",
    name: "settings",
    component: Setting,
  },
  {
    path: "/debug",
    name: "debug",
    component: Debug,
  },
  {
    path: "/chat",
    name: "chat",
    component: Chat,
  },
];

const router: VueRouter.Router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: routes,
});

router.beforeEach((to, from, next) => {
  //get cookies from main.ts
  // const $cookies = inject<VueCookies>("$cookies")

  if (to.name !== "login" && !store.state.isLoggedIn) {
    console.log(store.state.isLoggedIn);
    console.log("redirecting to login");
    next({ name: "login" });
  } else if (to.name === "login" && store.state.isLoggedIn) {
    console.log("redirecting to profile");
    next({ name: "settings" });
  } else {
    console.log("next");
    next();
  }
});

export default router;
