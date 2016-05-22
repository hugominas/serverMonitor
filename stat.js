'use strict';

const data = require('./controlers/data').data;
const info = require('./controlers/info').info;
const readServer = require('./controlers/readServer').server;
const http = require("http");


// START HTTP server
var server = http.createServer(function(request, response) {
  if(/getAcess/.test(request.url)){
    readServer.getAcess().then((data)=>{
      response.writeHead(200, {"Content-Type": "text/json"});
      response.write(data);
      response.end();
    }).catch((err)=>{
      console.log(err)
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write("<!DOCTYPE \"html\">");
      response.write("<html>");
      response.write("<head>");
      response.write("<title>Error</title>");
      response.write("</head>");
      response.write("<body>");
      response.write("Error");
      response.write("</body>");
      response.write("</html>");
      response.end();
    });
  }else if(/getOs/.test(request.url)){

  }else if(/getErrors/.test(request.url)){
    readServer.getErrors().then((data)=>{
      console.log(data)
      response.writeHead(200, {"Content-Type": "text/json"});
      response.write(data);
      response.end();

    });
  }

});

server.listen(8000)



// START APP
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
