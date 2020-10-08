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

# def write_influx(country,county,city,location,zone,sensorId,username,type,value):
#     clientdb.write_points([{
#         "measurement":"sensors",
#         "tags": {
            
#             },
#         "fields":{
#             "country": country,
#             "county": county,
#             "city": city,
#             "location": location,
#             "zone": zone,
#             "sensorId":sensorId,
#             "username":username,
#             "type": type,
#             "value": float(value)
#             }
#     }])
    
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

def injectIntoInflux():
    
    print("Inject into influx")
    
    value=30.7543
    write_influx('Romania','bucuresti','bucuresti','demo','hala','demodemo','demo','temperature',value)
    
while True:
  localtime = time.localtime()
  result = time.strftime("%I:%M:%S %p", localtime)
  print(result)
  if(int(result[6:8]) % 1 == 0):
    injectIntoInflux()
  time.sleep(1)
