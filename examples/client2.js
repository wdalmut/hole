var Hole = require('./../index.js');

var hole = new Hole({
  name: "client2",
  host: "127.0.0.1",
  port: 41234,
  bind: 41236
});

hole.on('ready', function() {
  hole.punch("client1");
}).on("punch", function(socket) {
  process.stdin.pipe(socket).pipe(process.stdout);
});

