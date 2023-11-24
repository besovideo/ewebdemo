<!--
-->
<template>
  <div class="player_puplayer-demo">
    <h3>对讲</h3>
    <p>
      <button @click="puList">查看设备列表</button>
      <select style="width:150px" @change="dange">
        <Option>请选择设备</Option>
        <Option v-for="(item, index) in id" :key="index">{{ item.id }}</Option>
      </select>
      <label>通道号：</label>
      <input v-model.number="index" type="text" placeholder="通道号 （数字）" />
    </p>
    <p>
      <!-- 初始化和销毁 -->
      <button v-if="!instance" @click="init">初始化播放器</button>
      <button v-else @click="destroy">销毁播放器</button>
    </p>
    <div ref="playerContainer" class="player-container"></div>
    <p v-if="instance">
      <!-- 打开和关闭 -->
      <button v-if="closed" @click="open">建立连接</button>
      <button v-else @click="close">关闭连接</button>

      <!-- 显示和隐藏 -->
      <button v-if="hidden" @click="display">显示</button>
      <button v-else @click="hide">隐藏</button>
    </p>
    <p v-for="(item, index) in messages" :key="index">{{ index }}.{{ item }}</p>
    <!-- <pre>{{ messages.join("\n") }}</pre> -->
  </div>
</template>

<script>
import { Intercom } from "@besovideo/webrtc-player";
import "@besovideo/webrtc-player/dist/main.es.css";

export default {
  name: "IntercomDemo",
  props: {
    token: String,
  },
  data() {
    return {
      r: "",
      id: [],
      index: 0,
      instance: null,

      videoFit: "fill",
      closed: true,
      hidden: false,
      moved: false,
      messages: [],
      messageIndex: 0,
    };
  },
  methods: {
    init() {
      if (!this.token || !this.id) return;
      const { instance } = Intercom({
        container: this.$refs.playerContainer,
        token: this.token,
        puOption: {
          id: this.r,
          index: 0,
        },
        onConnected: () => {
          this.messages.push("onConnected 连接已建立");
        },
        onConnectedFailed: () => {
          this.messages.push("onConnectedFailed 连接建立失败");
        },
        onClose: () => {
          this.messages.push("onClose 连接已关闭（对讲关闭）");
        },
        onDisConnected: () => {
          this.messages.push("onDisConnected  连接已关闭（服务器断开连接）");
        },
        onDestroy: () => {
          this.messages.push("onDestroy 对讲实例已销毁");
        },
      });
      //this.messages.push("toeken:" + this.token);
      this.messages.push("init 初始化成功");
      this.instance = instance;
    },
    dange(e) {
      this.r = e.target.value;
      console.log(this.r);
    },
    //获取设备列表
    async puList() {
      if (!this.token) return;
      try {
        const r = await fetch("/bvcsp/v1/pu/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.token,
          },
          body: JSON.stringify({
            page: 0,
            pageSize: 1000,
            needStatus: true
          }),
        });
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          //console.log(JSON.stringify(res));
          let data = res.data;
          this.id = [];
          if (data) {
            data.forEach((item) => {
              if (item.status == 1) {
                let obj = {
                  id: item.id,
                };
                //console.log(obj);
                this.id.push(obj);
              }
            });
          }
          //console.log(this.id);
          return;
        }
        //throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    // 销毁
    destroy() {
      // destroy前会执行close
      this.instance?.destroy();
      this.instance = null;
      this.closed = true;
    },
    // 打开连接
    async open() {
      if (!this.instance) return;
      try {
        await this.instance.open();
        this.closed = false;
      } catch (e) {
        console.log(e);
      }
    },
    // 关闭连接
    close() {
      this.instance?.close();
      this.closed = true;
    },
    // 显示
    display() {
      this.instance?.display();
      this.hidden = false;
    },
    // 隐藏
    hide() {
      this.instance?.hidden();
      this.hidden = true;
    },
  },
};
</script>

<style scoped lang="less">
.player_puplayer-demo {
  .player-container {
    height: 350px;
    width: 500px;
    border: 1px solid #ddd;
  }

  .player-container2 {
    margin-top: 8px;
    height: 250px;
    width: 330px;
    border: 1px solid #ddd;
  }

  pre {
    line-height: 1.5;
    font-size: 15px;
  }
}
</style>
