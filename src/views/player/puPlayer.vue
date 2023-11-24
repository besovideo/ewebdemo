<!--
 * @Author: Shirtiny
 * @Date: 2021-12-30 13:53:41
 * @LastEditTime: 2021-12-31 19:11:06
 * @Description: 
-->
<template>
  <div class="player_puplayer-demo">
    <h3>视频播放 PuPlayer</h3>
    <p>
      <button @click="puList">查看设备列表</button>
      <select style="width:150px"  @change="dange">
          <Option>请选择设备</Option>
          <Option v-for="(item,index) in id" :key="index" >{{item.id}}</Option>         
      </select> 
      <label>通道号：</label
      ><input
        v-model.number="index"
        type="text"
        placeholder="通道号 （数字）"
      />
    </p>
    <p>
      <!-- 初始化和销毁 -->
      <button v-if="!instance" @click="init">初始化播放器</button>
      <button v-else @click="destroy">销毁播放器</button>
    
    </p>
    <!-- 播放器容器 -->
    <div ref="playerContainer" class="player-container"></div>
    <p v-if="instance">
      <!-- 打开和关闭 -->
      <button v-if="closed" @click="open">建立连接</button>
      <button v-else @click="close">关闭连接</button>
      

      <!-- 视频如何适应容器 -->
      <label>适应容器：</label>
      <select :value="videoFit" @change="handleVideoFit">
        <option value="contain">保持比例</option>
        <option value="fill">填充</option>
      </select>
      
     

      <!-- 显示和隐藏 -->
      <button v-if="hidden" @click="display">显示</button>
      <button v-else @click="hide">隐藏</button>
      

      <!-- 移动和更换容器 -->
      <button @click="move">更换容器</button>
      
    </p>
    <!-- 播放器容器2 -->
    <div ref="playerContainer2" class="player-container2"></div>
    <h3>回调</h3>
    <p>
      <button v-if="messages.length" @click="() => (messages = [])">
        清空
      </button>
    </p>
    <pre>{{ messages.join("\n") }}</pre>
  </div>
</template>

<script>
import { PuPlayer } from "@besovideo/webrtc-player";
export default {
  name: "PuPlayerDemo",
  props: {
    token: String,
  },
  data() {
    return {
      r:"",
      id: [],
      index: 0,
      videoFit: "fill",

      instance: null,
      closed: true,
      hidden: false,
      moved: false,
      messages: [],
    };
  },
  methods: {
    // 初始化
    init() {
      if (!this.token || !this.id) return;
      const { instance } = PuPlayer({
        // (可选) 容器节点 注意一个容器内只能存在一个实例  当container为假值（包括false、null、undefined）时 将返回实例引用的dom节点 容器必须指定高度 参考高德地图
        container: this.$refs.playerContainer,
        // 必填 设备选项
        puOption: {
          // 设备id
          id: this.r,
          // 设备通道号
          index: 0,
        },
        // 必填 用户授权令牌
        token: this.token,
        videoFit: this.videoFit,
        // (可选) 双击是否全屏
        fullScreenOnDblclick: true,
        // (可选) 启用控制器
        enableController: true,
        onConnected: () => {
          this.messages.push("onConnected 连接已建立");
        },
        onConnectedFailed: () => {
          this.messages.push("onConnectedFailed 连接建立失败");
        },
        onClose: () => {
          this.messages.push("onClose 连接已关闭（播放器关闭）");
        },
        onDisConnected: () => {
          this.messages.push("onDisConnected  连接已关闭（服务器断开连接）");
        },
        onDestroy: () => {
          this.messages.push("onDestroy 播放器实例已销毁");
        },
      });

      this.instance = instance;
    },
    dange(e){
      this.r=e.target.value;
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
    // 改变videoFit
    handleVideoFit(e) {
      if (!this.instance) return;
      const v = e.target.value;
      this.instance.setVideoFit(v);
      this.videoFit = v;
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
    // 移动和更换容器
    move() {
      this.instance?.moveTo(
        this.moved ? this.$refs.playerContainer : this.$refs.playerContainer2
      );
      this.moved = !this.moved;
    },
  },
  mounted() {},
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
