// Example Redis client
"use strict";

var sprintf = require('sprintf-js').sprintf;
var util = require("util");
var Redis = require("ioredis");
var redis = new Redis({
  showFriendlyErrorStack: true,
  sentinels: [
    // This should be the FQDN of the `rfs-ldrs` Kubernetes Service
    // which should work as long as there is a Sentinel up and running
    { host: "10.233.48.161", port: 26379 },
  ],
  name: "mymaster"
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function dumpStats(iterations, initial, current) {
  util.log(sprintf("total iterations: %-10d  initial value: %-10d  current value: %-10d", iterations, initial, current))
}

function onExit() {
  redis.get(key).then(function(final) {
    util.log('exitting...')
    dumpStats(iterations, value, final)
    redis.del(key)
    redis.quit()
    process.exit(0)
  })
}
process.on('SIGINT', onExit)
process.on('SIGTERM', onExit)

// Generate a random key to avoid collisions between multiple clients
var iterations = 0
var key = sprintf("test-key-%05d", getRandomInt(1000))
var value = getRandomInt(10)
util.log(sprintf("key: %-23s  initial value: %-10d", key, value))
redis.set(key, value)

function dumpCounter() {
  redis.get(key).then(function(current) {
    dumpStats(iterations, value, current)
  });
}
setInterval(dumpCounter, 1000); //time is in ms

function incCounter() {
  redis.incr(key).then(function() {
    iterations++
  })
}
setInterval(incCounter, 10); //time is in ms
