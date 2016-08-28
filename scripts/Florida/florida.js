var http = require('http');
var url = require('url');
var fs = require('fs');
var AWS = require('aws-sdk');

// Settings
var port = process.env.DYNOMITE_FLORIDA_PORT ?
    process.env.DYNOMITE_FLORIDA_PORT : 8080;

var apiUrl = process.env.DYNOMITE_FLORIDA_REQUEST ?
    process.env.DYNOMITE_FLORIDA_REQUEST : '/REST/v1/admin/get_seeds';

// Parse command line options
var seedsFilePath = process.argv[2] && process.argv[2].length > 0 ?
        process.argv[2] : '/etc/dynomite/seeds.list';
var enableDebug = process.argv[3] === 'debug' ? true : false;

http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname;
  enableDebug && console.log('Request: ' + path);

  res.writeHead(200, {'Content-Type': 'application/json'});
  if (path === apiUrl) {
    if (process.env.DYNOMITE_S3_SEED_FILE) {
        console.log("Retrieving seed file from S3");

        // We assume that credentials are available through IAM Role
        // Otherwise, should be configured properly locally (http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html)
        AWS.config.update({
            region: 'eu-west-1'
        });

        // Seed file retrieved from S3
        var s3 = new AWS.S3();

        var params = {
          Bucket: 'poc-dynomite-backups',
          Key: 'seeds.list',
          ResponseContentType: 'text/plain'
        };

        s3.getObject(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
            console.log(data.Body.toString('utf-8'));
            var fileContent = data.Body.toString('utf-8');

            var now = (new Date()).toJSON();
            var seeds = fileContent.trim().replace(/\n/g, '|');

            enableDebug && console.log(now + ' - get_seeds [' + seeds + ']');
            res.write(seeds);
            res.end();
          }
        });
    } else {
        fs.readFile(seedsFilePath, 'utf-8', function(err, data) {
          if (err) console.log(err);

          var now = (new Date()).toJSON();
          var seeds = data.trim().replace(/\n/g, '|');

          enableDebug && console.log(now + ' - get_seeds [' + seeds + ']');
          res.write(seeds);
          res.end();
        });
    }
  } else {
    res.end();
  }
}).listen(port);

console.log('Server is listening on ' + port);
