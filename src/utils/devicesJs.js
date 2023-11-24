

export default {
  install: function(app){
    app.config.globalProperties.getDevices = (token) => getDevices(token);
    // Vue.prototype.sayHelloWorld = sayHelloWorld;
  },
}

async function getDevices(token) {
  if (!token)
    return null;
  try {
    const r = await fetch("/bvcsp/v1/pu/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        page: 0,
        pageSize: 20,
        needStatus: true,
        filter: {
          status: 1,
        }
      }),
    });

    if (r.ok || (r.status >= 200 && r.status < 300)) {
      const res = await r.json();
      console.log(JSON.stringify(res));
      let data = res.data;
      let devices = new Array();
      if (data) {
        data.forEach((item) => {
          let device = {
            id: item.id,
            gid: item.gid,
            name: item.name,
            desc: item.desc,
            channels: [],
            gps: null,
          };
          let channels = data.channels;
          if (channels) {
            channels.forEach((chItem) => {
              let channel = {
                index: chItem.index,
                mediaDir: chItem.mediaDir,
                ptz: chItem.ptz,
                name: chItem.name,
              };
              device.channels.push(channel)
            });
          }
          if (data.gps) {
            let gps = {
              lng: data.gps.lng,
              lat: data.gps.lat,
              time: data.gps.time,
            };
            device.gps = gps;
          }
          devices.push(device);
        });
      }
      return devices;
    }
    throw new Error(`${r.status} ${r.statusText}`);
  } catch (e) {
    console.error(e);
  }
}
