// Require dependencies
var AWS = require('aws-sdk');
var lambda = new AWS.Lambda({region: 'us-east-1'});
var Promise = require('bluebird');
var AdmZip = require('adm-zip');

// Set configuration variables
var CONCURRENT_JOB_LIMIT = 50;
var config = process.argv.reduce(function(memo, arg, index) {
  switch (arg) {
    case '-n':
      memo.totalRequests = process.argv[index + 1];
      break;
    case '-c':
      memo.concurrentRequests = process.argv[index + 1];
      memo.beamsPerBee = Math.ceil(
        1.0 * memo.concurrentRequests / CONCURRENT_JOB_LIMIT);
      break;
    case '-u':
      memo.url = process.argv[index + 1];
      break;
  }
  return memo;
}, {});
if (config.concurrentRequests < CONCURRENT_JOB_LIMIT) {
  config.beeCount = config.concurrentRequests;
} else config.beeCount = CONCURRENT_JOB_LIMIT;
config.iterations = Math.ceil(
  1.0 * config.totalRequests / config.concurrentRequests);

// Create a zip file from the code for Lambda to consume
var zip = new AdmZip();
zip.addLocalFile('bee.js');
zip.addLocalFile('laser.js');

// Configure beeWithFrickinLaserBeam Lambda function
var createFunctionParams = {
  Code: {
    ZipFile: zip.toBuffer()
  },
  FunctionName: 'bee',
  Handler: 'bee.handler',
  Role: 'arn:aws:iam::816502430665:role/lambda_exec_role',
  Runtime: 'nodejs',
  MemorySize: 1024,
  Timeout: 3
};

var createFunction = Promise.promisify(lambda.createFunction, lambda);
createFunction(createFunctionParams).
  then(function(e) {
  console.log('Releasing',
    config.beeCount,
    'bee(s) with',
    config.beamsPerBee,
    'frickin\' laser beam(s) each for',
    config.iterations,
    'attack(s).');

  var invokeParams = {
    FunctionName: 'bee',
    Payload: JSON.stringify({
      url: config.url,
      beamsPerBee: config.beamsPerBee
    })
  };

  // Start sending waves of requests
  sendInTheBees(config.iterations - 1, invokeParams);
});

var invoke = Promise.promisify(lambda.invoke, lambda);
function sendInTheBees(iterations, invokeParams, totals) {
  // Kick off all the jobs
  var invokedBees = [];
  for (var i = 0; i < config.beeCount; i++) {
    invokedBees.push(invoke(invokeParams));
  }
  var payload;

  Promise.all(invokedBees).then(function(results){
    // Run calculations on our results
    totals = results.reduce(function(memo, result) {
      payload = JSON.parse(result.Payload);
      memo.codes = payload.codes.reduce(function(m, v) {
        if (memo.codes.indexOf(v) === -1) m.push(v);
        return m;
      });
      memo.time += payload.time * 1.0 / config.beeCount / config.iterations;
      memo.hits += config.beamsPerBee;
      return memo;
    }, totals || { time: 0, hits: 0, codes: [] });

    if (iterations > 0) {
      console.log('Sending in', iterations, 'more swarms.');
      sendInTheBees(iterations - 1, invokeParams, totals);
    } else {
      console.log('Sent', totals.hits, 'hits');
      console.log('Recieved codes:', totals.codes);
      console.log('Mean request time:', parseInt(totals.time), 'ms');
      lambda.deleteFunction({FunctionName: 'bee'}).send();
    }
  }).catch(function(e) {
    console.log(e);
    lambda.deleteFunction({FunctionName: 'bee'}).send();
  })
}