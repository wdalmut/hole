var Hole = require('./../index.js');

var hole = new Hole({
  name: "client2",
  host: "127.0.0.1",
  port: 41234,
  bind: 41236
});

hole.on('ready', function() {
  hole.on('punch', function(socket) {
    console.log("now we are connected!");
    socket.pipe(process.stdout);
    process.stdin.pipe(socket);
  });

  hole.create("client1");
});

