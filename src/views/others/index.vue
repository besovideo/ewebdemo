<template>
  <div class="player">
    <h3 class="title">获取token</h3>

    <form @submit.prevent="loginout">
      <p>
        <input v-model="username" type="text" placeholder="用户名" />
        <input v-model="password" type="password" placeholder="密码" />
        <button v-if="!isLogin">登录</button>
        <button v-else>退出登录</button>
      </p>
    </form>

    <p class="text">结果: {{ result }}</p>
    <p class="text">当前token: {{ token }}</p>

    <router-view :token="token" :username="username"></router-view>
  </div>
</template>

<script>
import { clearAllDialog } from "@besovideo/webrtc-player";
import "@besovideo/webrtc-player/dist/main.es.css";
import { SHA256Timestamp } from "../../utils/shaUtils";

export default {
  name: "Player",
  data() {
    return {
      username: "root",
      password: "123456",
      isLogin: false,
      result: "",
      token: "",
    };
  },
  methods: {
    async loginout() {
      if (this.isLogin) this.logout();
      else this.login();
    },
    // 登录
    async login() {
      // https://bvcsp.apifox.cn/api-171248814
      const { username, password } = this;
      if (!username || !password) return;
      try {
        const sha256T = SHA256Timestamp(username, password);
        const r = await fetch("/bvcsp/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            ...sha256T,
          }),
        });
        this.result = `${r.status} ${r.statusText}`;

        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          this.result += ` code: ${res.code}, msg: ${res.msg}`;
          // 设置token
          this.token = res.data?.token;
          this.isLogin = true;
          this.setCookie("Authorization", this.token, res.data?.timeout);

          return;
        }
        throw new Error(this.result);
      } catch (e) {
        console.error(e);
      }
    },
    async logout() {
      const token = this.token;
      if (!token) return;
      try {
        const r = await fetch("/bvcsp/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: token,
          },
        });
        this.result = `${r.status} ${r.statusText}`;

        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          this.result += ` code: ${res.code}, msg: ${res.msg}`;
          // 设置token
          this.token = "";
          this.isLogin = false;
          return;
        }
        throw new Error(this.result);
      } catch (e) {
        console.error(e);
      }
    },
    setCookie: function (cname, cvalue, exsecond) {
      var d = new Date();
      d.setTime(d.getTime() + exsecond * 1000);
      var expires = "expires=" + d.toUTCString();
      console.info(cname + "=" + cvalue + "; " + expires);
      document.cookie = cname + "=" + cvalue + "; " + expires;
      console.info(document.cookie);
    },
    //获取cookie
    getCookie: function (cname) {
      var name = cname + "=";
      var ca = document.cookie.split(";");
      console.log("获取cookie,现在循环");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        console.log(c);
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(name) != -1) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    //清除cookie
    clearCookie: function () {
      this.setCookie("username", "", -1);
    },
    checkCookie: function () {
      var user = this.getCookie("username");
      if (user != "") {
        alert("Welcome again " + user);
      } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
          this.setCookie("username", user, 365);
        }
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
  width: 720px;
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
