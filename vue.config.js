/*
 * @Author: Shirtiny
 * @Date: 2021-12-30 14:51:39
 * @LastEditTime: 2021-12-30 14:57:08
 * @Description:
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "^/bvcsp": {
        target: "http://115.28.79.237",
        ws: true,
        changeOrigin: true,
      },
      "^/bvvtdu": {
      target: "http://115.28.79.237",
        ws: true,
        changeOrigin: true,
      },
      "^/bvnru": {
    target: "http://115.28.79.237",
        ws: true,
        changeOrigin: true,
      }
    },
    
   
  },
});
