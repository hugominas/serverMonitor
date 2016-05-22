'use strict';

const fs = require("fs-extra");


function appLog(){
  this.debug = true;
  this.data= { os:[], sites:[] };
  this.createLogFolder();

}


appLog.prototype.getData = function(){
    this.readLogFile('logs/osLog.json',(data)=>{if(data){this.data.os=data.data||[];}});
    this.readLogFile('logs/siteLog.json',(data)=>{if(data){this.data.sites=data.data||[];}});
}

appLog.prototype.setData = function(data){
  if(data.hasOwnProperty('os'))this.data.os.push(data.os)
  if(data.hasOwnProperty('sites'))this.data.sites.push(data.sites)
    this.saveLogFile(this.data);
}

appLog.prototype.readLogFile = function(file, callback){
      fs.readJson(file, function (err, data) {
        callback(data)
      })
  }

appLog.prototype.saveLogFile = function(data){
    fs.writeJson('logs/osLog.json', {data:data.os})
    fs.writeJson('logs/sitesLog.json', {data:data.sites})

  }

appLog.prototype.createLogFolder = function(){
      let dir = 'logs';
      let _this = this;
      fs.ensureDir(dir, function (err) {
        _this.log(err) // => null
        // dir has now been created, including the directory it is to be placed in
      });
    }


appLog.prototype.log = function(msg){
  if(this.debug)console.log(msg);
}


exports.data = new appLog();
