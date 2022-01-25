<!--
-->
<template>
  <div class="conferenceDiv" v-show="token != null && token != ''">
    <div>
      <button :disabled="token == ''" @click="getGroupList">
        获取群组列表
      </button>

      <select
        v-on:change="groupSelect"
        :class="
          'groupStatus' + [groups.length <= 0 ? 0 : groups[groupIndex].status]
        "
      >
        <option
          v-for="(item, index) in groups"
          :key="index"
          :class="'groupStatus' + [item.status]"
        >
          {{ item.name }}
        </option>
      </select>
      <template v-if="groups.length != 0">
        <button v-if="groups[groupIndex].status == 0" @click="createConference">
          开启会议
        </button>
        <button v-else @click="destroyConference">关闭会议</button>

        <button @click="getGroupUserList">获取群组成员列表</button>
        <button @click="getConferenceUserList">获取会议成员列表</button>
        <button @click="conferenceClear">清除数据</button>
      </template>
      <template v-if="conferMembers.length != 0">
        <button v-if="!isInConference()" @click="joinConference">
          加入会议
        </button>
        <button v-else @click="quitConference">退出会议</button>

        <button v-if="!isSpack" @click="speakApplyInConference">
          申请发言
        </button>
        <button v-else @click="speakEndInConference">结束发言</button>
      </template>
    </div>
    <div>
      <template v-if="conferMembers.length != 0 && isInConference()">
        <button v-if="!instance" @click="initConference">
          初始化Conference
        </button>
        <button v-else @click="deinitConference">销毁Conference</button>
        <!-- 打开和关闭 -->
        <template v-if="instance">
          <button v-if="closed" @click="openConference">建立连接</button>
          <button v-else @click="closeConference">关闭连接</button>
        </template>
      </template>
    </div>
    <div id="conferenceView" v-show="groupMembers.length > 0">
      <div class="groupList">
        <ul class="groupMemberUl">
          <li class="groupMemberLi">群组成员列表</li>
          <li
            class="groupMemberLi"
            v-for="(item, index) in groupMembers"
            :key="index"
            :class="'groupStatus' + [item.onlineStatus]"
          >
            {{ item.memberID }}
          </li>
        </ul>
      </div>
      <div class="groupList">
        <ul class="groupMemberUl">
          <li class="groupMemberLi">会议成员列表</li>
          <li
            class="groupMemberLi"
            v-for="(item, index) in conferMembers"
            :key="index"
            :class="'groupStatus' + [item.status]"
          >
            {{ item.memberID }}
          </li>
        </ul>
      </div>
    </div>

    <div class="player_puplayer-demo">
      <div ref="playerContainer" class="player-container"></div>
    </div>
    <p v-for="(item, index) in messages" :key="index">{{ index }}.{{ item }}</p>
  </div>
</template>

<script>
import { Conference } from "@besovideo/webrtc-player";
import "@besovideo/webrtc-player/dist/main.es.css";

export default {
  props: {
    token: String,
    username: String,
  },
  data() {
    return {
      groups: [],
      groupIndex: 0,
      groupMembers: [],
      conferMembers: [],
      result: "",
      messages: [],
      isSpack: false,
      wss: null,

      instance: null,

      closed: true,
    };
  },
  methods: {
    //获取群组成员列表
    async getGroupList() {
      if (!this.token) return;
      try {
        const r = await fetch("/bvcsp/v1/imgroup/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.token,
          },
          body: JSON.stringify({
            page: 0,
            pageSize: 20,
          }),
        });

        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          // console.log(JSON.stringify(res));
          let data = res.data;
          this.groups = [];
          if (data) {
            data.forEach((item) => {
              let obj = {
                id: item.id,
                name: item.name,
                desc: item.desc,
                creator: item.creator,
                createTime: item.createTime,
                status: 0,
              };
              this.groups.push(obj);
              //判断是否存在会议，即该群组是否开启会议
              this.getConferenceInfo(obj);
            });
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    //获取会议信息，即判断该群组是否开启会议
    async getConferenceInfo(groupObj) {
      if (!this.token) return;
      try {
        console.log("/bvcsp/v1/imgroup/conference/info/" + groupObj.id);
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/info/" + groupObj.id,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
          }
        );
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          if (res.data) {
            groupObj.status = 1;
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    //获取群组成员列表
    async getGroupUserList() {
      if (!this.token || this.groups.length == 0) return;
      try {
        const r = await fetch(
          "/bvcsp/v1/imgroup/members/list/" + this.groups[this.groupIndex].id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
            body: JSON.stringify({
              page: 0,
              pageSize: 20,
              needStatus: true,
            }),
          }
        );

        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          // console.log(JSON.stringify(res));
          let data = res.data;
          this.groupMembers = [];
          if (data) {
            data.forEach((item) => {
              let obj = {
                id: item.id,
                memberID: item.memberID,
                memberType: item.memberType,
                memberName: item.memberName,
                name: item.name,
                permissions: [],
                onlineStatus: item.status,
                conferStatus: 0,
              };
              let permissions = item.permissions;
              if (permissions) {
                permissions.forEach((permission) => {
                  let ipermission = {
                    id: permission.id,
                    level: permission.level,
                  };
                  obj.permissions.push(ipermission);
                });
              }
              //获取会议成员
              this.groupMembers.push(obj);
            });
          }
          this.getConferenceUserList();
          // console.log(JSON.stringify(this.groupMembers));
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    //获取会议成员列表，主要是用于判断那些群组成员加入了会议
    async getConferenceUserList() {
      if (!this.token || this.groups.length == 0) return;
      try {
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/members/" +
            this.groups[this.groupIndex].id,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
          }
        );

        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          // console.log(JSON.stringify(res));
          let data = res.data;
          this.conferMembers = [];
          if (data) {
            data.forEach((element) => {
              let groupMember = this.groupMembers.find((item) => {
                return item.id == element.id;
              });
              if (groupMember) {
                groupMember.conferStatus = element.status;
              }
              let obj = {
                id: element.id,
                memberID: element.memberID,
                memberType: element.memberType,
                status: element.status,
              };
              this.conferMembers.push(obj);
            });
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    groupSelect(e) {
      this.groupIndex = e.target.options.selectedIndex;
      this.getGroupUserList();
    },
    async createConference() {
      if (!this.token || this.groups.length == 0) return;
      try {
        const r = await fetch("/bvcsp/v1/imgroup/conference/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.token,
          },
          body: JSON.stringify({
            id: this.groups[this.groupIndex].id,
          }),
        });
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          if (res.data && res.data.id) {
            this.groups[this.groupIndex].status = 1;
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    async destroyConference() {
      if (!this.token || this.groups.length == 0) return;
      try {
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/" + this.groups[this.groupIndex].id,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
          }
        );
        this.result = `${r.status} ${r.statusText}`;
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          this.result += ` code: ${res.code}, msg: ${res.msg}`;
          if (res.code == 0) {
            this.groups[this.groupIndex].status = 0;
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(this.result);
      } catch (e) {
        console.error(e);
      }
    },
    async joinConference() {
      if (
        !this.token ||
        this.groups.length == 0 ||
        this.groups[this.groupIndex].status == 0
      )
        return;
      try {
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/join/apply/" +
            this.groups[this.groupIndex].id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
          }
        );
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          if (res.code == 0) {
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    async quitConference() {
      if (
        !this.token ||
        this.groups.length == 0 ||
        this.groups[this.groupIndex].status == 0
      )
        return;
      try {
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/quit/" +
            this.groups[this.groupIndex].id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
          }
        );
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          if (res.code == 0) {
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    conferenceClear() {
      this.groups = [];
      this.groupIndex = 0;
      this.messages = [];
      this.result = "";
      this.groupMembers = [];
      this.isSpack = false;
    },
    isInConference() {
      if (!this.token || this.conferMembers.length == 0) return false;
      let member = this.conferMembers.find((item) => {
        return item.memberID === this.username;
      });
      if (member && member.status > 0) return true;
      return false;
    },
    async speakApplyInConference() {
      if (
        !this.token ||
        this.groups.length == 0 ||
        this.groups[this.groupIndex].status == 0
      )
        return;
      try {
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/speak/apply/" +
            this.groups[this.groupIndex].id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
          }
        );
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          if (res.code == 0) {
            this.isSpack = true;
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    async speakEndInConference() {
      if (
        !this.token ||
        this.groups.length == 0 ||
        this.groups[this.groupIndex].status == 0
      )
        return;
      try {
        //let member = this.groupMembers.find(item => { return item.memberID == this.username; });
        const r = await fetch(
          "/bvcsp/v1/imgroup/conference/speak/end/" +
            this.groups[this.groupIndex].id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
            body: JSON.stringify({
              memberid: this.username,
            }),
          }
        );
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          if (res.code == 0) {
            this.isSpack = false;
            this.getGroupUserList();
          }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    async initWebSocket() {
      if (!this.token || this.groups.length == 0) return;
      try {
        //let member = this.groupMembers.find(item => { return item.memberID == this.username; });
        const r = await fetch("/bvcsp/v1/ws/event/conference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Sec-WebSocket-Protocol": this.token,
          },
          query: JSON.stringify({
            token: this.token,
          }),
        });
        if (r.ok || (r.status >= 200 && r.status < 300)) {
          const res = await r.json();
          console.log(JSON.stringify(res));
          // if (res.code == 0) {
          //   this.getGroupUserList();
          // }
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
      // this.wss = new WebSocket("wss://192.168.6.111:9781/bvcsp/v1/ws/event/conference/", this.token);
      // this.wss.onmessage = function(e) { console.log(JSON.stringify(e.data)); };
      // this.wss.onopen = function() { console.log("wss.onopen"); }
      // this.wss.onerror = function() { console.log("wss.onerror"); }
      // this.wss.onclose = function() { console.log("wss.onclose"); }
    },
    initConference() {
      if (
        !this.token ||
        this.groupMembers.length == 0 ||
        this.groups[this.groupIndex].status == 0
      )
        return;
      let member = this.groupMembers.find((item) => {
        return item.memberID == this.username;
      });
      if (!member) return;

      const { instance } = Conference({
        confOption: {
          id: this.groups[this.groupIndex].id,
          index: member.id,
        },
        container: this.$refs.playerContainer,
        token: this.token,
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
      this.messages.push(
        "id:" + this.groups[this.groupIndex].id + ", index: " + member.id
      );
      this.messages.push("init 初始化成功");
      this.instance = instance;
    },
    deinitConference() {
      // destroy前会执行close
      this.instance?.destroy();
      this.instance = null;
      this.closed = true;
    },
    async openConference() {
      if (!this.instance) return;
      try {
        await this.instance.open();
        this.closed = false;
        this.getConferenceUserList();
      } catch (e) {
        console.log(e);
      }
    },
    closeConference() {
      this.instance?.close();
      this.closed = true;
    },
  },
};
</script>

<style scoped lang="less">
.conferenceDiv {
  padding: 0;
  margin: 0;
  button {
    margin: 2px;
  }
  input {
    width: 120px;
  }
  select {
    width: 120px;
    padding-top: 3px;
    padding-bottom: 1px;
    margin: 2px;
  }
  #conferenceView {
    width: 100%;
    height: auto;
    position: unset;
    display: inline-block;
    .groupList {
      width: 20%;
      float: left;
      li {
        list-style-type: none;
      }
      .groupMemberUl {
        background: #3399ff;
        margin: 0;
        padding: 1px;
      }

      .groupMemberLi {
        background: #cce5ff;
        margin: 3px;
        padding-left: 3px;
        padding-right: 3px;
        height: 30px;
        line-height: 30px;
      }
      .memberInfoUl {
        margin: 0;
        padding: 5px;
        height: 50%;
      }
      .memberInfoLi {
        float: left;
        margin: 0px;
        width: 40px;
      }
    }
  }
  .groupStatus0 {
    color: black;
  }
  .groupStatus1 {
    color: rgb(14, 146, 14);
  }
  .groupStatus2 {
    color: blue;
  }
  .groupStatus3 {
    color: red;
  }
}

.player_puplayer-demo {
  .player-container {
    height: 100px;
    width: 100%;
    border: 1px solid #ddd;
  }
  pre {
    line-height: 1.5;
    font-size: 15px;
  }
}
</style>
