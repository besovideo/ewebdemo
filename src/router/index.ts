import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/player",
    name: "Player",
    component: () => import("../views/player/index.vue"),
    redirect: "/player/puPlayer",
    children: [
      {
        path: "puPlayer",
        component: () => import("../views/player/puPlayer.vue"),
      },
      {
        path: "intercom",
        component: () => import("../views/player/intercom.vue"),
      },
      
      {  
        path: "conference",
        component: () => import("../views/player/conference.vue"),
      },
       {
        path: "websocketConference",
        component: () => import("../views/player/websocketConference.vue"),
      },
      {
        path: "playback",
        component: () => import("../views/player/playback.vue"),
      },
    ],
  },
  {
    path: "/others",
    name: "Others",
    component: () => import("../views/others/index.vue"),
    children: [
      {
        path: "subscribe",
        component: () => import("../views/others/subscribe.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
