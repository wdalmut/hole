var util = require('util');
var _ = require('underscore');
var process = require('process');
var EventEmitter = require('events');
var pipe = require('stream').prototype.pipe;

var Hole = function(options) {
  if (!(this instanceof Hole)) {
    return new Hole(options);
  }

  var self = this;
  this.options = options = _.extend({
    name: process.pid,
    address: "127.0.0.1",
    port: 54213,
    bind: 54214,
    heartbeat: 1000,
  },options);
  this.intervalId = false;

  EventEmitter.call(this);

  var dgram = require('dgram');
  this.socket = socket = dgram.createSocket("udp4");

  socket.on('error', function(data) {
    self.emit('error', data);
  });

  socket.on('listening', function(data) {
    self.emit('ready', data);
  });

  socket.on('message', function(message, rinfo) {
    try {
      var data = JSON.parse(message);

      if (data) {
        switch (data.type) {
          case 'connect':
            self.clearInterval();

            self.options.port = data.port;
            self.options.address = data.address;
            self.startHeartbeat();

            self.emit('punch', self.socket, rinfo);
            break;
          case 'heartbeat':
            break;
          default:
            socket.emit('data', message);
        }
      }
    } catch(e) {
      socket.emit('data', message);
    }

  });

  socket.write = function (message) {
    if (typeof message === "string") {
      message = new Buffer(message, "utf8");
    }

    socket.send(message, 0, message.length, self.options.port, self.options.address);

    return true;
  };

  socket.end = function () {
    setImmediate(function () {
      socket.close();
    });
  };

  socket.pause = function () {
    socket.paused = true;
    return this;
  };

  socket.resume = function () {
    socket.paused = false;
    return this;
  };


  socket.bind(options.bind, function() {
    // present myself
    var message = JSON.stringify({
      type: "me",
      name: self.options.name,
    });
    socket.send(message, 0, message.length, self.options.port, self.options.address);
  });
  socket.pipe = pipe;
};

util.inherits(Hole, EventEmitter);

Hole.prototype.startHeartbeat = function() {
  var self = this;
  this.intervalId = setInterval(function() {
    var data = JSON.stringify({
      type: "heartbeat",
      body: "heartbeat",
    });

    self.socket.send(data, 0, data.length, self.options.port, self.options.address);
  }, self.options.heartbeat);
};

Hole.prototype.clearInterval = function() {
  if (this.intervalId) {
    clearInterval(this.intervalId);
    this.intervalId = false;
  }
};

Hole.prototype.punch = function(name) {
  var self = this;
  self.intervalId = setInterval(function() {
    var data = JSON.stringify({
      name: self.options.name,
      connect: name,
    });
    self.socket.send(data, 0, data.length, self.options.port, self.options.address);
  }, self.options.heartbeat);
};

module.exports = Hole;
