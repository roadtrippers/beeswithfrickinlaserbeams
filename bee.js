var cp = require('child_process');

exports.handler = function handler(event, context) {
  var count = event.beamsPerBee;
  var codes = [];
  var time = 0;

  for(var i = 0; i < event.beamsPerBee; i++) {
    var child = cp.fork('laser.js').
      on('message', function(m) {
        if (codes.indexOf(m.code) === -1) codes.push(m.code)
        time += m.time * 1.0 / event.beamsPerBee;
        count--;
        if(count === 0) {
          context.succeed({
            time: time,
            codes: codes
          });
        }
      });
    child.send({url: event.url});
  }
};
