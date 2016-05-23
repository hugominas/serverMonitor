'use strict';

const source = '$http_client_ip $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" "$upstream_response_time" $request_time $host $upstream_status $upstream_addr $http_deviceType $http_productId $http_appVersion $http_market';
const parser = require("nginx-log-parser")(source);
const fs = require("fs-extra");


function readServer (){}


readServer.prototype.getFile = function(path){
  return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', function (err, data) {
        if(err)reject(err)
        resolve(data);
      })
  })
}

readServer.prototype.getErrors = function(){
  return new Promise((resolve, reject) => {
    this.getFile('/var/log/nginx/error.log').then((data)=>{
      resolve(parser(data));
    }).catch((err)=>{{
      if(err)reject(err)
    }})
  })
}

readServer.prototype.getAcess = function(){
  return new Promise((resolve, reject) => {
    this.getFile('/var/log/nginx/access.log').then((data)=>{
      resolve(parser(data));
    }).catch((err)=>{{
      if(err)reject(err)
    }})
  })
}

readServer.prototype.getOs = function(){
  return new Promise((resolve, reject) => {
    let _this = this,
        allData = {os:[], sites:[]},
        allItems = [],
        allkeys = [];

    fs.walk('./logs/')
      .on('data', function (item) {
        if(/osLog/.test(item.path))
        allItems.push(item.path)
        allkeys.push('os')
        if(/sitesLog/.test(item.path))
        allItems.push(item.path)
        allkeys.push('sites')
      })
      .on('end', function () {
        Promise.all(allItems.map((e)=>{return _this.getFile(e);}))
          .then((data)=>{
            data.forEach((e,i)=>{
              if(allkeys[i]=='os'){allData.os.push(data[i])}else{allData.sites.push(e)}
            })
            resolve(allData);
          })
          .catch((err)=>{_this.log(err)});
      })


  })
}

exports.server = new readServer();
