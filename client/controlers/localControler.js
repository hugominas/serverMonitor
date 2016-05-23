const requestHeaders = require("request-headers");
requestHeaders('http://hugomineiro.com', function(err, statusCode, headers) {
  _this.log('Content type: ' + headers);
});
