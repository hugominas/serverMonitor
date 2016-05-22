'use strict';

const monitor = require("os-monitor");
const requestHeaders = require("request-headers");
const fs = require("fs-extra");
const exec = require('child_process').exec


function appMonitor(){}

appMonitor.prototype.run = function(){
  this.data= { os:[], sites:[] };
  this.debug = true;
  this.createLogFolder();
  this.startMonitor();
  this.getData();
  this.events();
};

appMonitor.prototype.getData = function(){
    this.readLogFile('logs/osLog.json',this.data.os);
    this.readLogFile('logs/siteLog.json',this.data.sites);
}

appMonitor.prototype.setData = function(data){
    startMonitor.saveLogFile(this.data);
}

appMonitor.prototype.readLogFile = function(file, dataBack){
      this.log(file,dataBack)
      fs.readJson(file, function (err, data) {
        if(data)dataBack=data.data||[]
      })
  }

appMonitor.prototype.saveLogFile = function(data){
    fs.writeJson('logs/osLog.json', {data:data.os})
    fs.writeJson('logs/sitesLog.json', {data:data.sites})

  }

appMonitor.prototype.createLogFolder = function(){
      let dir = 'logs';
      let _this = this;
      fs.ensureDir(dir, function (err) {
        _this.log(err) // => null
        // dir has now been created, including the directory it is to be placed in
      });
    }

appMonitor.prototype.checkDisk = function(){
  return new Promise((resolve, reject) => {
      //this.log('getDiskUsage: start');
    	exec('df -k', function (error, df, stderr) {
    		if (error) {
                this.log(error);
    			this.error('getDiskUsage: Error running df command', 'getDiskUsage', error, callback);
          reject(error)
    		}
    		//this.log('getDiskUsage: Popen success, start parsing');

    		// Split out each volume
    		let volumes = df.split(/\n/);

    		//this.log('getDiskUsage: parsing, split');

    		// Remove first (headings) and last (blank) lines
    		volumes.shift();
    		volumes.pop();

    		//this.log('getDiskUsage: parsing, pop');

    		var usageData = [];

    		// Set some defaults
    		var previousVolume = null;
    		var volumeCount = 0;

    		//this.log('getDiskUsage: parsing, start loop');

    		var reg = /([0-9]+)/;

    		var totalAvail = 0, totalUsed = 0;
    		volumes.forEach(function (volume) {
          //this.log('getDiskUsage: parsing volume:' + volume);
          // Split out the string
          var vol = volume.split(/\s+/);
          if(/sda/.test(vol[0])){
      			if (reg.exec(vol[1]) != null && reg.exec(vol[2]) != null && reg.exec(vol[3]) != null) {
                      vol[1] = vol[1] / 1024 / 1024;
                      vol[2] = vol[2] / 1024 / 1024; // Used
      				vol[3] = vol[3] / 1024 / 1024; // Available
                      vol[4] = parseFloat(vol[4].replace('%', '')); // used %
                      var mountedOn = vol[5];
                      vol[5] = 100 - vol[4]; // Available %
                      vol[6] =  mountedOn // Mounted On
      				totalUsed += vol[2];
      				totalAvail += vol[3];
      				//usageData.push(vol);
            }
    			}

    		}, this);

            // mac gives us extra data we don't want so we need to remove three additional positions
            // columns to remove: iused ifree %iused these are the 5,6 and 7 positions in the array
            if (process.platform == 'darwin') {
                usageData.forEacheach(function (volume, index) {
                    usageData[index][6] = usageData[index][8];
                    usageData[index].splice(7,4);
                });
            }

    		//this.log('getDiskUsage: completed, returning');
            var totalSize = totalUsed + totalAvail;
            var totalUsedPercent = parseFloat(parseFloat(totalUsed / totalSize  * 100).toFixed(2));
            var totalAvailPercent = parseFloat(parseFloat(totalAvail / totalSize  * 100).toFixed(2));
    		usageData.push(['total', totalSize, totalUsed, totalAvail, totalUsedPercent, totalAvailPercent, "-"]);
          console.log(1)
            resolve(usageData);

    	});
    })
    }

appMonitor.prototype.startMonitor = function(){
      // more advanced usage with configs.
      monitor.start({ delay: 5000 // interval in ms between monitor cycles
                    , freemem: 0.1 // freemem under which event 'freemem' is triggered
                    , uptime: 1000000 // number of secs over which event 'uptime' is triggered
                    , critical1: 0.7 // loadavg1 over which event 'loadavg1' is triggered
                    , critical5: 0.7 // loadavg5 over which event 'loadavg5' is triggered
                    , critical15: 0.7 // loadavg15 over which event 'loadavg15' is triggered
                    , silent: false // set true to mute event 'monitor'
                    , stream: true // set true to enable the monitor as a Readable Stream
                    , immediate: false // set true to execute a monitor cycle at start()
                    })
    }

appMonitor.prototype.getProcesses = function () {
  return new Promise((resolve, reject) => {
  let _this = this
	_this.log('getProcesses: start');

    // Get output from ps
    exec('ps aux --sort -rss', function (err, ps, stderr){
        if (err) {
            _this.error('Command "ps auxww" failed', 'getProcesses', err, callback);
            reject(err)
			return false;
        }
        // Split out each process
        var processLines = ps.split(/\n/);
        // remove top and bottom line
        processLines.splice(0,1);
        processLines.pop();
        processLines.splice(3,processLines.length-1);
        var processes = [];



        processLines.forEach(function (line){
			line = line.split(/\s+/);
            // we only want 0 - 10 columns, everything with a white space after _this must belong to the last column
            // remove the additional columns and place them in extra
			var extra = line.splice(11, line.length);

            line[10] = line[10] + ' ' + extra.join(' ');

            processes.push(line);

        });

		_this.log('getProcesses: complete');
    resolve(processes)

    });
  })
};

appMonitor.prototype.pingMonitor = function(){
      let _this = this;
      requestHeaders('http://hugomineiro.com', function(err, statusCode, headers) {
        _this.log('Content type: ' + headers);
      });
    }

appMonitor.prototype.log = function(msg){
  if(this.debug)console.log(msg);
}

appMonitor.prototype.events = function(){
  let _this = this;
  // define handler that will always fire every cycle
  monitor.on('monitor', function(event) {
    Promise.all([
      _this.pingMonitor(),
      _this.getProcesses(),
      _this.checkDisk()
    ]).then((data)=>{
      event.process=data[1];
      event.disk=data[2];
      _this.data.os.push(event)
      _this.data.sites.push(data[0])
      _this.setData();
    }).catch((err)=>{

    })

  });

  // define handler for a too high 1-minute load average
  monitor.on('loadavg1', function(event) {
    console.log(event.type, ' Load average is exceptionally high!');
  });

  // define handler for a too low free memory
  monitor.on('freemem', function(event) {
    console.log(event.type, 'Free memory is very low!');
  });
}


let startMonitor = new appMonitor();
startMonitor.run();
