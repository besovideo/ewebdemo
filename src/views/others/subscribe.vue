<template>
  <div>
    <button @click="init">获取在线设备列表</button>
    <button
      v-show="isSubscribe != null"
      v-if="!isSubscribe"
      @click="subscribeGps"
    >
      订阅GPS
    </button>
    <button v-show="isSubscribe != null" v-else @click="unSubscribeGps">
      取消订阅
    </button>
    <button @click="clearData">清除数据</button>
    <p>======== 在线设备列表 ========</p>
    <ul>
      <li v-for="(item, index) in devices" :key="index">
        <input type="checkbox" v-model="item.isCheck" />
        {{ item.name }}
      </li>
    </ul>
    <p>===== 控制台界面，打印收到的位置数据 ======</p>
    <textarea
      rows="10"
      cols="20"
      v-model="logText"
      @change="textareaOnChange"
      id="gpsLog"
    >
    </textarea>
  </div>
</template>

<script>
export default {
  name: "Subscribe",
  props: {
    token: String,
  },
  data() {
    if (typeof WebSocket === "undefined") {
      alert("您的浏览器不支持socket");
    }
    return {
      devices: null,
      websock: null,
      websocktimer: null,
      isSubscribe: null,
      logText: "",
    };
  },
  methods: {
    async init() {
      this.devices = await this.getDevices(this.token);
      this.isSubscribe = false;
    },
    print() {
      if (this.devices) {
        this.devices.forEach((item) => {
          if (item.isCheck) {
            console.log(item.name + " is selected");
          }
        });
      }
    },
    subscribeGps() {
      if (!this.devices) return;
      if (this.websock) this.websock.close();
      // this.setCookie("Content-Type", "application/json", 5);
      // this.setCookie("Sec-WebSocket-Protocol", this.token, 3600);
      // console.log(this.getCookie("Sec-WebSocket-Protocol"));
      const protocol = location.protocol === "https:" ? "wss" : "ws";
      const server = window.location.host;
      const wsuri = `${protocol}://${server}/bvcsp/v1/ws/gpsdata?token=${this.token}`;

      this.websock = new WebSocket(wsuri); //, [this.token]);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    unSubscribeGps() {
      if (this.websock) {
        let wsds = [];
        this.devices.forEach((item) => {
          if (item.isCheck) wsds.push(item.id);
        });
        let subCmd = JSON.stringify({
          badd: false,
          puid: wsds,
        });
        console.log(subCmd);
        this.websock.send(subCmd);
        this.isSubscribe = false;
      }
    },
    websocketonmessage(e) {
      // console.log(JSON.parse(e.data));
      let objData = JSON.parse(e.data);
      if (!objData) return;
      let gpsData = `DeviceID: ${objData.devId}, lat: ${Number(
        objData.lat
      ).toFixed(6)}, lng: ${Number(objData.lng).toFixed(6)}, height: ${
        objData.height
      }`;
      this.logText += "\n" + gpsData;
      this.textareaOnChange();
    },
    websocketonopen() {
      console.log("OPENED");
      this.websocktimer = setInterval(() => {
        if (this.websock) {
          this.websock.send("");
        }
      }, 20000);
      if (this.websock) {
        let wsds = [];
        this.devices.forEach((item) => {
          if (item.isCheck) wsds.push(item.id);
        });
        let subCmd = JSON.stringify({
          badd: true,
          puid: wsds,
        });
        console.log(subCmd);
        this.websock.send(subCmd);
        this.isSubscribe = true;
      }
    },
    websocketonerror() {
      //连接建立失败重连
      if (this.websocktimer) {
        clearInterval(this.websocktimer);
        this.websocktimer = null;
      }
      console.log("ERROR");
    },
    websocketclose(e) {
      //关闭
      if (this.websocktimer) {
        clearInterval(this.websocktimer);
        this.websocktimer = null;
      }
      console.log("断开连接", e);
    },
    textareaOnChange() {
      document.getElementById("gpsLog").scrollTop =
        document.getElementById("gpsLog").scrollHeight;
    },
    clearData() {
      this.devices = null;
      if (this.websock) this.websock.close();
      this.websock = null;
      if (this.websocktimer) clearInterval(this.websocktimer);
      this.websocktimer = null;
      this.isSubscribe = null;
      this.logText = "";
    },
  },
};
</script>

<style>
li {
  list-style-type: none;
  padding: 0px;
  margin: 0px;
}
textarea {
  width: 100%;
}
</style>