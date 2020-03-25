// Example Redis client
"use strict";

var sprintf = require('sprintf-js').sprintf;
var util = require("util");
var Redis = require("ioredis");
var redis = new Redis({
  enableOfflineQueue: false,
  showFriendlyErrorStack: true,
  sentinels: [
    // This should be the FQDN of the `rfs-ldrs` Kubernetes Service
    // which should work as long as there is a Sentinel up and running
        { host: "rfs-ldrs", port: 26379 },
    //  { host: "10.233.48.161", port: 26379 },
  ],
  name: "mymaster"
});

redis.on('error', function(err) {
  if (err.toString().indexOf('ECONNRESET') < 0 &&
      err.toString().indexOf('ECONNREFUSED') < 0 &&
      err.toString().indexOf('EHOSTUNREACH') < 0 &&
      err.toString().indexOf('ETIMEDOUT') < 0) {
    util.log(sprintf('Redis error: %s', err.toString()))
  } else {
    util.log(sprintf('Redis error: %s', (err.stack || '').split('\r\n')))
  }
});
redis.on('end', function() {
  util.log('Redis  error: connection lost. No more retries.')
});
redis.on('reconnecting', function() {
  util.log('Redis error: reconnecting error')
});
redis.on('ready', function() {
  util.log('Connected to Redis.')
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function dumpStats(key, iterations, current) {
  util.log(sprintf("key: %-20s  total iterations: %-10d  current value: %-10d", key, iterations, current))
}

function onExit() {
  redis.get(key).then(function(final) {
    util.log('exitting...')
    dumpStats(key, iterations, final)
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
dumpStats(key, iterations, 0)

function dumpCounter() {
 redis.get(key).then(function(current) {
   dumpStats(key, iterations, current)
 }).catch(function (error) {
   console.error(error)
 })
}
setInterval(dumpCounter, 1000); //time is in ms

function incCounter() {
  redis.incr(key).then(function() {
    iterations++
  }).catch(function (error) {
    console.error(error)
  })
}
setInterval(incCounter, 10); //time is in ms
