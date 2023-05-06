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
        target: "http://192.168.6.57:9780",
        ws: true,
        changeOrigin: true,
      },
      "^/bvvtdu": {
        target: "http://192.168.6.57:9780",
        ws: true,
        changeOrigin: true,
      },
      "^/bvnru": {
      target: "http://192.168.6.57:9780",
        ws: true,
        changeOrigin: true,
      }
    },
    
   
  },
};
