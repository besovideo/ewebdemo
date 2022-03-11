
function setCookie(cname, cvalue, exsecond) {
  let d = new Date();
  d.setTime(d.getTime() + (exsecond * 1000));
  let expires = "expires=" + d.toUTCString();
  console.info(cname + "=" + cvalue + "; " + expires);
  document.cookie = cname + "=" + cvalue + "; " + expires;
  // console.info(document.cookie);
}
//获取cookie
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  // console.log("获取cookie,现在循环")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    // console.log(c)
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) != -1){
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export default {
  install: function(Vue){
    Vue.prototype.setCookie = (cname, cvalue, exsecond) => setCookie(cname, cvalue, exsecond);
    Vue.prototype.getCookie = (cname) => getCookie(cname);
    // Vue.prototype.sayHelloWorld = sayHelloWorld;
  },
}