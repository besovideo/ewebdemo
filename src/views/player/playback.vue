<template>
  <div>
    <div class="playbackMainDiv">
      
      <button @click="puList">查看设备列表</button>
        <select style="width:150px"  @change="dange">
            <option>请选择设备</option>
            <option v-for="(item,index) in id" :key="index" >{{item.id}}</option>         
        </select> 
      <!-- <input v-model.number="puid" type="text"/> -->
      <button @click="getDeviceFiles">设备文件检索</button>
      <button @click="getPlatformFiles">平台文件检索</button>
      <button @click="cleanData">清空数据</button>
  
      <p/>
      
      <!-- <BvPlayback token="" ></BvPlayback> -->
      <table cellspacing="0px" v-show="recordFiles.length>0" border="1px">
        <tr align="center">
          <td>puID</td>
          <td>fileType</td> 
          <td>fileName</td>
          <td>channelIndex</td> 
          <td>beginTime</td>
          <td>endTime</td>
          <td>fileSize</td>
          <td>download</td>
          <td>play</td>
        </tr>
        <tr v-for="(item, index) in recordFiles" :key="index" v-show="item.fileType == 'video'" align="center">
          <td>{{ item.puID }} </td>
          <td>{{ item.fileType }} </td> 
          <td>{{ item.fileName }} </td>
          <td>{{ item.channelIndex }} </td> 
          <td>{{ formatPts(item.beginTime) }} </td>
          <td>{{ formatPts(item.endTime) }} </td>
          <td>{{ Number(item.fileSize / 1024 / 1024).toFixed(2) }}M </td>
          <td><button @click="downloadFiles(item.fileID)">download</button></td>
          <td><button @click="playFiles(item.fileID)">play</button></td>
        </tr>
      </table>
    </div>
    <!-- 点击play按钮之后弹出的视频回放 -->
    <!-- <div class="playback-player" v-if="mediaUrl" @click="mediaUrl = ''">
      <video :src="mediaUrl" class="video" controls id="playback-video"></video>
    </div> -->
    <el-dialog
    v-model="dialogVisible"
    draggable
    destroy-on-close
    title="视频回放"
    align-center
    >
      <!-- 视频回放组件的容器 -->
      <!-- 
        src:  视频播放的相对路径 平台文件:/bvnru/v1/download/文件ID  设备文件:/bvcsp/v1/pu/download/" + 设备ID + "/" + 文件ID
        barrage: 是否开启弹幕，默认为false
        apiPreUrl: src的前缀，默认为空
       -->
      <div style="width: 100%;height: 400px;">
        <BvPlayback :src="SRC" :barrage="true"></BvPlayback>
      </div>
    </el-dialog>
  </div>
  </template>
  
  <script>
  import BvPlayback from "@besovideo/bvplayback";
  export default {
    props: {
      token: String,
      username: String,
    },
    data() {
      return {
        recordFiles: [],
        puid: "",
        id:[],
        mediaUrl: "",
        dialogVisible: false
      }
    },
    components: {
      BvPlayback
    },
    methods: {
      dange(e){
        this.puid=e.target.value;
        console.log(this.r);
      },
      //获取设备列表
      async puList(){
        if (!this.token) return;
        try{
          const r=await fetch("/bvcsp/v1/pu/list",{
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
            body: JSON.stringify({
              page: 0,
              pageSize: 1000,
              needStatus:true
            }),
          });
        if (r.ok || (r.status >= 200 && r.status < 300)) {
            const res = await r.json();
            //console.log(JSON.stringify(res));
            let data = res.data;
            this.id = [];
            if (data) {
              data.forEach((item) => {
                if(item.status==1){
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
        }catch(e){
          console.error(e);
        }  
      },
      async getPlatformFiles(){
        if (!this.token) return;
        try {
          const r = await fetch("/bvcsp/v1/recordfile/filter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
            body: JSON.stringify({
              page: 0,
              pageSize: 1000,
              filter: {
                beginTime: 946656000,
                endTime: Date.parse(new Date()) / 1000,
              },
            }),
          });
  
          if (r.ok || (r.status >= 200 && r.status < 300)) {
            const res = await r.json();
            console.log(JSON.stringify(res));
            if (res.code == 0) {
              let data = res.data;
              this.recordFiles = [];
              if (data) {
                data.forEach((item) => {
                  let obj = {
                    id: item.id,
                    fileID: item.fileID,
                    nrulID: item.nrulID,
                    puID: item.puID,
                    userID: item.userID,
                    channelIndex: item.channelIndex,
                    filePath: item.filePath,
                    fileType: item.fileType,
                    fileSize: item.fileSize,
                    fileHash: item.fileHash,
                    beginTime: item.beginTime,
                    endTime: item.endTime,
                    insertTime: item.insertTime,
                    recordReason: item.recordReason,
                    desc1: item.desc1,
                    desc2: item.desc2,
                    fileName: item.fileName,
                    url: "/bvnru/v1/download/" + item.fileID,
                  };
                  this.recordFiles.push(obj);
                });
              }
            }
            return;
          }
          throw new Error(`${r.status} ${r.statusText}`);
        } catch (e) {
          console.error(e);
        }
      },
      async getDeviceFiles(){
        if (!this.token) return;
        try {
          console.log("PTS = " + Date.parse(new Date()) / 1000);
          let puid = this.puid;
          const r = await fetch("/bvcsp/v1/pu/recordfile/filter/" + puid, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.token,
            },
            body: JSON.stringify({
              page: 0,
              pageSize: 100,
              filter: {
                beginTime: 946656000,
                endTime: Date.parse(new Date()) / 1000,
                puID: puid,
                userID: "",
                fileType: [],
                recordReason: [],
                channelIndex: -1,
                desc1: "",
                desc2: "",
                match: "",
              },
            }),
          });
  
          if (r.ok || (r.status >= 200 && r.status < 300)) {
            const res = await r.json();
            console.log(JSON.stringify(res));
            if (res.code == 0) {
              let data = res.data;
              this.recordFiles = [];
              if (data) {
                data.forEach((item) => {
                  let obj = {
                    id: 0,
                    fileID: item.fileID,
                    nrulID: "",
                    puID: puid,
                    userID: "",
                    channelIndex: item.channelIndex,
                    filePath: item.filePath,
                    fileType: item.fileType,
                    fileSize: item.fileSize,
                    fileHash: "",
                    beginTime: item.beginTime,
                    endTime: item.endTime,
                    insertTime: item.insertTime,
                    recordReason: item.recordReason,
                    desc1: item.desc1,
                    desc2: item.desc2,
                    fileName: "",
                    url: "",
                  };
                  let len = obj.filePath.length;
                  let startLen = obj.filePath.lastIndexOf('/') + 1;
                  obj.fileName = obj.filePath.substring(startLen, len);
                  console.log("filePath:" + obj.filePath + ", fileName:" + obj.fileName + ", len:" + len + ", sl:" + startLen);
                  obj.url = "/bvcsp/v1/pu/download/" + puid + "/" + obj.fileID;
                  this.recordFiles.push(obj);
                });
              }
            }
            return;
          }
          throw new Error(`${r.status} ${r.statusText}`);
        } catch (e) {
          console.error(e);
        }
      },
      async downloadFiles(fileid){
        if (!this.token || this.recordFiles.length <= 0) return;
        try {
          console.log("PTS = " + Date.parse(new Date()) / 1000);
          let obj = this.recordFiles.find(item => { return item.fileID == fileid; });
          if(!obj)
            throw new Error(`file is not exist!`);
          console.log("url:"+obj.url+", name:"+obj.fileName);
          
          let createObjectURL = function(object) {
            return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object); 
          }
          let xhr = new XMLHttpRequest();
          let formData = new FormData();
          xhr.open('get', obj.url);  //url填写后台的接口地址，如果是post，在formData append参数（参考原文地址）
          xhr.setRequestHeader("Authorization", this.token);
          xhr.responseType = 'blob';
          xhr.onload = function () {
            if (this.status == 200) {
              let blob = this.response;
              let filename = obj.fileName;
              console.log(this.response)
              if (window.navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, filename);
              } else {
                let a = document.createElement('a');
                let url = createObjectURL(blob);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
              }
            }
          };
          xhr.send(formData);
        } catch (e) {
          console.error(e);
        }
      },
      playFiles(fileid){
        if (!this.token || this.recordFiles.length <= 0) return;
        try {
          console.log("PTS = " + Date.parse(new Date()) / 1000);
          let obj = this.recordFiles.find(item => { return item.fileID == fileid; });
          if(!obj || !obj.url)
            throw new Error(`file is not exist!`);
          this.mediaUrl = obj.url;
          console.log('视频的url',obj.url);
          this.dialogVisible = true
        } catch (e) {
          console.error(e);
        }
      },
      cleanData() {
        this.mediaUrl = "";
        this.recordFiles = [];
      },
      formatInt(num, len) {
        if (typeof(num) != 'number' || typeof(len) != 'number')
          return null;
        let str = num.toString();
        if(str.length < len) {
          let diff = len - str.length;
          while(diff>0){
            str = "0" + str;
            diff--;
          }
        }
        return str;
      },
      formatPts(pts) {
        //shijianchuo是整数，否则要parseInt转换
        let fixZero = this.formatInt;
        var time = new Date(pts * 1000);
        var y = time.getFullYear();
        var m = time.getMonth()+1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();
        return fixZero(y,4)+'/'+fixZero(m,2)+'/'+fixZero(d,2)+' '+fixZero(h,2)+':'+fixZero(mm,2)+':'+fixZero(s,2);
      },
    },
    computed: {
      SRC() {
        return this.mediaUrl
        // const arr = this.mediaUrl.split('/')
        // if(arr) {
        //   return arr[arr.length - 1]
        // }else {
        //   return ''
        // }
      }
    }
  };
  </script>
  
  <style scoped>
  #playback-video {
    height: 360px;
    width: 560px;  	
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: black;
  }
  .playbackMainDiv {
    z-index: 0;
  }
  .playbackMainDiv table {
    border-right: 1px solid rgb(180, 180, 180);
    border-bottom: 1px solid rgb(180, 180, 180);
    font-size: 10pt;
  }
  .playbackMainDiv table td {
    border-left: 1px solid rgb(180, 180, 180);
    border-top: 1px solid rgb(180, 180, 180);
  }
  .playback-player {
    /* float: left; */
    width: 100%;
    height: 100%;
    position: fixed;
    top:0px;
    right:0px;
    /* margin-top: -500px; */
    z-index: 9999;
    background-color: rgba(177, 177, 177, 0.514);
  }
  .el-dialog {
    height: 500px;
  }
  
  </style>