/*
 * @Author: Shirtiny
 * @Date: 2021-12-30 13:33:35
 * @LastEditTime: 2021-12-30 14:09:24
 * @Description:
 */
import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
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
];

const router = new VueRouter({
  routes,
});

export default router;
