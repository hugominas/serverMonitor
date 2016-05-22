'use strict';

const source = '$http_client_ip $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" "$upstream_response_time" $request_time $host $upstream_status $upstream_addr $http_deviceType $http_productId $http_appVersion $http_market';
const parser = require("nginx-log-parser")(source);
const fs = require("fs-extra");


function readServer (){}

readServer.prototype.getErrors = function(){
  return new Promise((resolve, reject) => {
      fs.readFile('/var/log/nginx/error.log', 'utf8', function (err, data) {
        if(err)reject(err)
        resolve(parser(data));
      })
  })
}

readServer.prototype.getAcess = function(){
  return new Promise((resolve, reject) => {
    fs.readFile('/var/log/nginx/access.log', 'utf8', function (err, data) {
      if(err)reject(err)
      resolve(parser(data));
    })
  })
}


exports.server = new readServer();
