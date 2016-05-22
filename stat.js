'use strict';

const data = require('./controlers/data').data
const info = require('./controlers/info').info

function appMonitor(){}

appMonitor.prototype.run = function(){
  info.startMonitor({ delay: 60000 // interval in ms between monitor cycles
                , freemem: 0.1 // freemem under which event 'freemem' is triggered
                , uptime: 1000000 // number of secs over which event 'uptime' is triggered
                , critical1: 0.7 // loadavg1 over which event 'loadavg1' is triggered
                , critical5: 0.7 // loadavg5 over which event 'loadavg5' is triggered
                , critical15: 0.7 // loadavg15 over which event 'loadavg15' is triggered
                , silent: false // set true to mute event 'monitor'
                , stream: true // set true to enable the monitor as a Readable Stream
                , immediate: false // set true to execute a monitor cycle at start()
                });
  data.getData();
};

let startMonitor = new appMonitor();
startMonitor.run();
