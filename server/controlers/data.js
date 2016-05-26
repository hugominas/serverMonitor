'use strict';

const fs = require("fs-extra");
const rotate = require('log-rotate');



function appLog(){
  this.debug = true;
  this.data= { os:[], sites:[] };
  this.createLogFolder();

}


appLog.prototype.getData = function(){
    this.readLogFile('./logs/osLog.json',(data)=>{if(data){this.data.os=data.data||[];}});
    this.readLogFile('./logs/siteLog.json',(data)=>{if(data){this.data.sites=data.data||[];}});
}

appLog.prototype.getLastData = function(){
    return this.data.os[this.data.os.length-1];
}

appLog.prototype.setData = function(data){
  if(data.hasOwnProperty('os') && typeof data.os !== 'undefined')this.data.os.push(data.os)
  if(data.hasOwnProperty('sites') && typeof data.sites !== 'undefined')this.data.sites.push(data.sites)
    this.saveLogFile();
}

appLog.prototype.readLogFile = function(file, callback){
      fs.readJson(file, function (err, data) {
        callback(data)
      })
  }

appLog.prototype.saveLogFile = function(data){
    fs.writeJsonSync('./logs/osLog.json', {data:this.data.os})
    fs.writeJsonSync('./logs/sitesLog.json', {data:this.data.sites})
        let dateFirst = new Date(this.data.os[0]['timestamp']*1000);
        let dateLast = new Date(this.data.os[this.data.os.length-1]['timestamp']*1000);
        // ROtate logs different days
        if(dateFirst.getDate()!==dateLast.getDate()){
          this.rotateLogFile('./logs/osLog.json');
          this.rotateLogFile('./logs/sitesLog.json');
        }
  }

appLog.prototype.rotateLogFile = function(path){
  rotate(path, { count: 3 }, function(err) {
    // ls ./ => test.log test.log.0 test.log.1
  });
  //Clean Data
  this.data.os=[];
  this.data.sites=[];
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
