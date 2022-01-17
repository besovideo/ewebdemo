/*
 * @Author: Shirtiny
 * @Date: 2021-12-30 14:51:39
 * @LastEditTime: 2021-12-30 14:57:08
 * @Description:
 */
module.exports = {
  devServer: {
    proxy: {
      "^/bvcsp": {
        target: "https://192.168.6.111:9781",
        ws: true,
        changeOrigin: true,
      },
      "^/bvvtdu": {
        target: "https://192.168.6.111:9781",
        ws: true,
        changeOrigin: true,
      }
    },
    // 此处开启 https
    https: true
  },
};
