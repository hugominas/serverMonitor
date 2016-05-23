'use strict';

const data = require('./controlers/data').data;
const info = require('./controlers/info').info;
const readServer = require('./controlers/readServer').server;
const http = require("http");
const secretKey = 'TOKEN'
const authToken = new RegExp(secretKey);
// START HTTP server
var server = http.createServer(function(request, response) {

    //CHECK FOR TOKEN
    if(authToken.test(request.url)){

      if(/getAcess/.test(request.url)){
        readServer.getAcess().then((data)=>{
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.write(JSON.stringify(data));
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
        readServer.getOs().then((data)=>{
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.write(JSON.stringify(data));
          response.end();
        })
      }else if(/getErrors/.test(request.url)){
        readServer.getErrors().then((data)=>{
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.write(JSON.stringify(data));
          response.end();

        });
      }

    }else{
      console.log('Not Authorized')
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write("<!DOCTYPE \"html\">");
      response.write("<html>");
      response.write("<head>");
      response.write("<title>Not Authorized</title>");
      response.write("</head>");
      response.write("<body>");
      response.write("Error-Not Authorized");
      response.write("</body>");
      response.write("</html>");
      response.end();
    }

});

server.listen(8000)



// START APP
function appMonitor(){}

appMonitor.prototype.run = function(){
  info.startMonitor({ delay: 5000 // interval in ms between monitor cycles
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
