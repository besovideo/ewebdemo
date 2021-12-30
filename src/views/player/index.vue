<!--
 * @Author: Shirtiny
 * @Date: 2021-12-30 14:08:17
 * @LastEditTime: 2021-12-30 16:44:04
 * @Description: 
-->
<template>
  <div class="player">
    <h3 class="title">获取token</h3>
    <p>
      <input v-model="username" type="text" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button @click="login">登录</button>
    </p>
    <p class="text">登录结果: {{ result }}</p>
    <p class="text">当前token: {{ token }}</p>

    <router-view :token="token"></router-view>
  </div>
</template>

<script>
import { clearAllDialog } from "@besovideo/webrtc-player";
import "@besovideo/webrtc-player/dist/main.es.css";

export default {
  name: "Player",
  data() {
    return {
      username: "admin",
      password: "123456",
      result: "",
      token: "",
    };
  },
  methods: {
    // 登录
    async login() {
      const { username, password } = this;
      if (!username || !password) return;
      try {
        const r = await fetch("/bvcsp/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });
        this.result = `${r.status} ${r.statusText}`;

        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          this.result += ` code: ${res.code}, msg: ${res.msg}`;
          // 设置token
          this.token = res.data?.token;
          return;
        }
        throw new Error(this.result);
      } catch (e) {
        console.error(e);
      }
    },
  },
  mounted() {
    // 释放全部本地播放器打开过的dialog
    clearAllDialog();
  },
};
</script>

<style scoped lang="less">
.player {
  width: 500px;
  .title {
    text-align: left;
  }
  .text {
    max-width: 100%;
    word-break: break-all;
    line-height: 1.5;
  }
}
</style>
