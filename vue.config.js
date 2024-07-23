/*
 * @Author: Shirtiny
 * @Date: 2021-12-30 14:51:39
 * @LastEditTime: 2021-12-30 14:57:08
 * @Description:
 */
const { defineConfig } = require("@vue/cli-service");

const targetUrl = "https://61.191.27.18:9781";

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "^/bvcsp": {
        target: targetUrl,
        ws: true,
        changeOrigin: true,
      },
      "^/bvvtdu": {
        target: targetUrl,
        ws: true,
        changeOrigin: true,
      },
      "^/bvnru": {
        target: targetUrl,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
