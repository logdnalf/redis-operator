#!/usr/bin/env python3
import random
import signal
import socket
import sys
import time
import threading

from redis.sentinel import Sentinel

sentinel = Sentinel([('rfs-ldrs', 26379)], socket_timeout=1)

master = sentinel.master_for('mymaster', socket_timeout=1, retry_on_timeout=True)

key = socket.gethostname()
counter = 0
master.set(key, 0)

# Handle graceful termination by deleting the key
def sigterm_handler(_signo, _stack_frame):
  print('Exiting...')
  try:
    master.delete(key)
  except:
    print("Unexpected error:", sys.exc_info()[0])
  sys.exit(0)
signal.signal(signal.SIGTERM, sigterm_handler)

def f():
  try:
    value = master.get(key)
    if value:
      print("key: %-20s  value: %-10d  couhter: %-10d" % (key, int(value), counter))
  except:
    print("Unexpected error:", sys.exc_info()[0])
  threading.Timer(1, f).start()
f()

while True:
  try:
    master.incr(key)
    counter += 1
  except:
    print("Unexpected error:", sys.exc_info()[0])
  delay_ms = random.randint(50, 250) / 1000.0
  time.sleep(delay_ms)
