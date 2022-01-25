<!--
-->
<template>
  <div class="player_puplayer-demo">
    <h3>Hello</h3>
    <p>
      <input v-model="id" type="text" placeholder="设备ID" />
      <label>通道号：</label>
      <input v-model.number="index" type="text" placeholder="通道号 （数字）" />
    </p>
    <p>
      <!-- 初始化和销毁 -->
      <template>
        <button v-if="!instance" @click="init">初始化播放器</button>
        <button v-else @click="destroy">销毁播放器</button>
      </template>
    </p>
    <div ref="playerContainer" class="player-container"></div>
    <p v-if="instance">
      <!-- 打开和关闭 -->
      <template>
        <button v-if="closed" @click="open">建立连接</button>
        <button v-else @click="close">关闭连接</button>
      </template>

      <!-- 显示和隐藏 -->
      <template>
        <button v-if="hidden" @click="display">显示</button>
        <button v-else @click="hide">隐藏</button>
      </template>
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
      id: "PU_8601",
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
          id: this.id,
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
