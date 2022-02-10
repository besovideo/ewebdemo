<!--
 * @Author: Shirtiny
 * @Date: 2021-12-30 13:33:35
 * @LastEditTime: 2021-12-30 14:21:35
 * @Description: 
-->
<template>
  <div class="home">
    <h1>Demo 列表</h1>
    <p>点击下方连接前往对应demo，代码在对应的路由中</p>
    <h3>播放器相关</h3>
    <ul>
      <li>
        <router-link to="/player/puPlayer"> 视频 </router-link>
      </li>
      <li>
        <router-link to="/player/intercom"> 对讲 </router-link>
      </li>
      <li>
        <router-link to="/player/conference"> 会议 </router-link>
      </li>
      <li>
        <router-link to="/player/playback"> 回放 </router-link>
      </li>
    </ul>
    <h3>其他</h3>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: {
    msg: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.home {
  text-align: center;
  h3 {
    margin: 40px 0 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #42b983;
  }
}
</style>
