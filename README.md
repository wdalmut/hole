# UDP/IP hole punching

Just an example to create an p2p communication with node streams.

```js
var Hole = require('udp-hole');

var hole = new Hole({
  name: "client2",
  host: "127.0.0.1", // server address
  port: 41234, // server port
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
```

