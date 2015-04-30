process.on('message', function(m) {
  var explicitProtocol = m.url.match(/^https|^http/);
  var protocol = require(explicitProtocol ? explicitProtocol[0] : 'http');
  var start = new Date();

  protocol.get(m.url, function(res) {
    process.send({ code: res.statusCode, time: new Date() - start });
    process.exit();
  });
});
