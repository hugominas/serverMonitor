'use strict';

const monitor = require("os-monitor");
const requestHeaders = require("request-headers");
const exec = require('child_process').exec
const dataCont = require('./data').data


function appInfo (){
  this.debug = false;

}

appInfo.prototype.checkDisk = function(){
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

            if(totalAvailPercent<5)this.notify({type: 'LOW DISK SPACE' })

            resolve(usageData);

    	});
    })
    }

appInfo.prototype.startMonitor = function(options){
      // more advanced usage with configs.
      monitor.start(options)
      this.events();

    }

appInfo.prototype.getProcesses = function () {
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

appInfo.prototype.pingMonitor = function(){
      let _this = this;
      //requestHeaders('http://hugomineiro.com', function(err, statusCode, headers) {
      //  _this.log('Content type: ' + headers);
      //});
    }

appInfo.prototype.log = function(msg){
  if(this.debug)console.log(msg);
}

appInfo.prototype.notify = function(msg){
let       nodemailer = require('nodemailer'),
          ses = require('nodemailer-ses-transport'),
          transporter = nodemailer.createTransport(ses({
              region: 'eu-west-1',
              accessKeyId: '',
              secretAccessKey: ''
          })),
          data = JSON.stringify(dataCont.getLastData(), null,3),
          emailHtml = 'The server is reaching its allocated capacity of '+msg.type+'<br> -------------------- <br>'+ data,
          subject = 'Server Notification -'+ msg.type,
          emailTo = 'hugo.rodrigues@hiperformancesales.com';


      transporter.sendMail ({
          from: 'noreply@liveperformancesales.com',
          to: emailTo,
          subject: subject,
          html: emailHtml
      }, function(err, info){
              if(err) {
                  this.log({
                      status: 'nok',
                      error: err
                  });
              }
      });
}

appInfo.prototype.events = function(){
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
      dataCont.setData({os:event,sites:data[0]})
    }).catch((err)=>{

    })

  });

  // define handler for a too high 1-minute load average
  monitor.on('loadavg1', function(event) {
    _this.notify({type: event.type })
    _this.log(event.type, ' Load average is exceptionally high!');
  });

  // define handler for a too low free memory
  monitor.on('freemem', function(event) {
    _this.notify({type: event.type })
    _this.log(event.type, 'Free memory is very low!');
  });
}


exports.info = new appInfo();
