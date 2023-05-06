<!--
-->
<template>
  <div class="conferenceDiv" v-show="token != null && token != ''">
    <div>
      步骤是登录--》开启会议--》邀请会议成员加入---》建立连接--》申请发言--》选择一个g771a文件---》将本地文件发送给后台--》这样设备就在播放g711a文件了，如果有不懂得可以联系我们提供远程指导
      g711a文件可以建立连接后，设备端申请发言然后点下载为g711a文件就有了
      请查看打印看连接是否建立成功
    </div>
    <div>
      <button :disabled="token == ''" @click="getGroupList">
        获取群组列表
      </button>
      <button @click="getGroupUserList">获取群组成员列表</button>
      <select v-on:change="groupSelect" :class="'groupStatus' + [groups.length <= 0 ? 0 : groups[groupIndex].status]
        ">
        <option v-for="(item, index) in groups" :key="index" :class="'groupStatus' + [item.status]">
          {{ item.name }}
        </option>
      </select>
      <br>
      <template v-if="groups.length != 0">
        <button v-if="groups[groupIndex].status == 0" @click="createConference">
          开启会议
        </button>
        <button v-else @click="destroyConference">关闭会议</button>


        <button @click="getConferenceUserList">获取会议成员列表</button>
        <button @click="InviteConferenceUserList">邀请所有会议成员加入</button>
      </template>
      <br>

      <template v-if="conferMembers.length != 0">
        <button v-if='InConference' @click="quitConference">退出会议</button>
        <button v-else @click="joinConference">
          加入会议
        </button>

        <button v-if="unConnect" @click="initConference">建立连接</button>
        <button v-else @click="unConference">关闭连接</button>

        <button v-if="!isSpack" @click="speakApplyInConference">
          申请发言
        </button>

        <button v-else @click="speakEndInConference">结束发言</button>
      </template>
    </div>
    <div>
      <template v-if="conferMembers.length != 0 && isInConference()">

        <button @click="download">下载为g711a文件</button>
        <input type="file" id="file">
        <button @click="socketSend">将本地g711a文件数据发送给后台</button>
        <button @click="conferenceClear">清除数据</button>
        <!-- 打开和关闭 -->
      </template>
    </div>
    <div id="conferenceView" v-show="groupMembers.length > 0">
      <div class="groupList">
        <ul class="groupMemberUl">
          <li class="groupMemberLi">群组成员列表</li>
          <li class="groupMemberLi" v-for="(item, index) in groupMembers" :key="index"
            :class="'groupStatus' + [item.onlineStatus]">
            {{ item.memberID }}
          </li>
        </ul>
      </div>
      <div class="groupList">
        <ul class="groupMemberUl">
          <li class="groupMemberLi">会议成员列表</li>
          <li class="groupMemberLi" v-for="(item, index) in conferMembers" :key="index"
            :class="'groupStatus' + [item.status]">
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
      closed: true,
      socket: null,
      interval: null,
      blods: [],
      sendIntervalId: null,
      unConnect: true,
      InConference: true
    };
  },
  methods: {
    download() {
      console.log(this.blods)

      let mergedBlob = this.mergeBlobs();
      console.log(mergedBlob);

      let fileUrl = URL.createObjectURL(mergedBlob);
      let aDom = document.createElement('a');
      aDom.setAttribute('href', fileUrl);
      aDom.setAttribute('download', fileUrl + '.g711a');
      aDom.click();
      URL.revokeObjectURL(fileUrl);
    },

    mergeBlobs() {

      let mergedBlob = new Blob(this.blods);

      // 清空接收数据数组
      this.blods = [];

      return mergedBlob;
    },
    socketSend() {


      const fileInput = document.getElementById("file");
      console.log(fileInput)

      fileInput.type = 'file';
      fileInput.accept = '.g711a';


      const file = fileInput.files[0];
      console.log(file)

      if (!file) {
        return;
      }

      const reader = new FileReader();


      reader.onload = (event) => {
        const buffer = event.target.result;

        const newbuffer = new ArrayBuffer(buffer.byteLength + 16); // 新建一个长度为原始数据长度+16字节的ArrayBuffer

        // 将前16个字节全部设置为0
        new DataView(newbuffer).setUint32(0, 0);
        new DataView(newbuffer).setUint32(4, 0);
        new DataView(newbuffer).setUint32(8, 0);
        new DataView(newbuffer).setUint32(12, 0);

        // 将原始数据复制到新的ArrayBuffer中
        new Uint8Array(newbuffer, 16).set(new Uint8Array(buffer));
        console.log(newbuffer)

        const mergeBlod = new Blob([newbuffer]);
        clearInterval(this.sendIntervalId);
        this.sendIntervalId = setInterval(() => {
          this.socket.send(mergeBlod);
        }, 40);
      };

      reader.readAsArrayBuffer(file);

    },
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
      console.log(this.groups[this.groupIndex].id)
      debugger
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
          console.log(res.data);

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
      this.InConference = true;
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
          this.getGroupUserList();
          this.getConferenceUserList();
          return;
        }
        throw new Error(`${r.status} ${r.statusText}`);
      } catch (e) {
        console.error(e);
      }
    },
    async InviteConferenceUserList() {
      if (
        !this.token ||
        this.groups.length == 0 ||
        this.groups[this.groupIndex].status == 0
      )
        return;
      try {
        const r = await fetch(
          " /bvcsp/v1/imgroup/conference/join/invite/" +
          this.groups[this.groupIndex].id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
            body: JSON.stringify({
              memberID: ''
            })
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
      this.InConference = false;
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
            this.getConferenceUserList()
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
          console.log(JSON.stringify(res.data.id));
          this.conferenceID = res.data.id;
          console.log(this.conferenceID);

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
    async initConference() {
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
      this.unConnect = false;
      const r = await fetch("/bvcsp/v1/dialog/conference/bvwsc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
        body: JSON.stringify({
          id: this.conferenceID,
          index: this.conferMembers[0].id,
        }),
      });

      if (r.ok || (r.status >= 200 && r.status < 300)) {

        const res = await r.json();
        console.log(res.data.url);
        console.log("ws://192.168.6.57:9780" + res.data.url);
        var socket = new WebSocket("ws://192.168.6.57:9780" + res.data.url);
        socket.binaryType = "arraybuffer"
        this.socket = socket
        this.interval = setInterval(function () {
          // 发送空消息
          socket.send('');
        }, 4000);
        socket.addEventListener("open", function () {
          console.log("websocket建立成功了");
        });
        let blods = this.blods
        socket.addEventListener("message", function (e) {
          console.log(e)
          blods.push(e.data.slice(16, e.data.byteLength))
          /*           let blob = new Blob([])
                    blob = e.data;
                    blob.arrayBuffer().then((arrayBuffer) => {
                      blods.push(arrayBuffer.slice(16, arrayBuffer.byteLength));
          
                    }) */
        });
        return;
      }



      //   throw new Error(`${r.status} ${r.statusText}`);
      // } catch (e) {
      //   console.error(e);
      // }
    },
    unConference() {
      console.log(this.socket)

      clearInterval(this.interval);
      this.socket.close();
      console.log('websocket连接关闭');
      this.unConnect = true;
    }
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
