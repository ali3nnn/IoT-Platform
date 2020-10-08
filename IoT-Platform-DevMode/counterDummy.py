import paho.mqtt.client as mqtt
import ssl
import time
from influxdb import InfluxDBClient

import random
import time
import threading

from time import sleep
import datetime

host = "localhost"
port = 8086
user = "root"
password = "root"
# dbname= "anysensor_dummy2"
dbname= "anysensor3"

clientdb = InfluxDBClient(host ,port, database=dbname)

def write_influx(country,county,city,location,zone,sensorId,username,sensorType,value):
    clientdb.write_points([{
        "measurement":"sensors",
        "tags": {
            "country": country,
            "county": county,
            "city": city,
            "location": location,
            "zone": zone,
            "sensorId":sensorId,
            "username":username,
            "type": sensorType
            },
        "fields":{
            "value": float(value)
            }
    }])
    
def injectIntoInflux2():
    
    print("Inject into influx")
    
    # value=int(random.uniform(0, 1))
    value = 1
    print('sensor151-c','alexbarbu2','counter',value)
    write_influx('Romania','bucuresti','bucuresti','bucuresti','depozit noriel','sensor151-c','alexbarbu2','counter',value)
    
    # noriel insert counter
    # ================================
    
    print('sensor200-c','noriel','counter',value)
    write_influx('Romania','bucuresti','bucuresti','depozit noriel','counter L1','sensor200-c','noriel','counter',value)
    
    
    # ================================
    # noriel insert counter
    
    print
    
def injectIntoInflux():
    
    print("Inject into influx")
    
    # value=int(random.uniform(0, 1))
    value = 1
    print('sensor150-c','alexbarbu2','counter',value)
    # sensor150c - stands for counter
    write_influx('Romania','bucuresti','bucuresti','bucuresti','depozit noriel','sensor150-c','alexbarbu2','counter',value)
    
    # noriel insert counter
    # ================================
    
    print('sensor201-c','noriel','counter',value)
    write_influx('Romania','bucuresti','bucuresti','depozit noriel','counter L2','sensor201-c','noriel','counter',value)
    
    # ================================
    # noriel insert counter
    
    
    print
    
    
while True:
  localtime = time.localtime()
  result = time.strftime("%I:%M:%S %p", localtime)
  print(result)
  if(int(result[6:8]) % 3 == 0):
    injectIntoInflux()
    
  if(int(result[6:8]) % 10 == 0):
    injectIntoInflux2()
    
  time.sleep(1)
