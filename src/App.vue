<!--
 * @Author: Shirtiny
 * @Date: 2021-12-30 13:33:35
 * @LastEditTime: 2021-12-30 16:58:16
 * @Description: 
-->
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style lang="less">
html,
body {
  margin: 0;
}

*,
*::after,
*::before {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
}

#nav {
  padding: 30px;
  text-align: center;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.main {
  display: flex;
  justify-content: center;

  p {
    label {
      font-size: 14px;
      margin-right: 8px;
    }
    input,
    select,
    button {
      outline: none;
      margin-right: 16px;
    }
  }
}
</style>
