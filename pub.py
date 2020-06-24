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
dbname= "anysensor_dummy2"

clientdb = InfluxDBClient(host ,port, database=dbname)

def write_influx(country,county,city,location,zone,sensorId,username,type,value):
    clientdb.write_points([{
        "measurement":"sensors",
        "tags": {
            
            },
        "fields":{
            "country": country,
            "county": county,
            "city": city,
            "location": location,
            "zone": zone,
            "sensorId":sensorId,
            "username":username,
            "type": type,
            "value": float(value)
            }
    }])

# The callback for when the client receives a CONNACK response from the server.
# def on_connect(client, userdata, flags, rc):
#     print("Connected with result code "+str(rc))

#     # Subscribing in on_connect() means that if we lose the connection and
#     # reconnect then subscriptions will be renewed.
#     client.subscribe("#")

# The callback for when a PUBLISH message is received from the server.
# def on_message(client, userdata, msg):
#     print(msg.topic+" "+str(msg.payload))
#     try:
#     	s = str(msg.topic).split('/')
#     	value = msg.payload
#     	# write_influx(s[0],s[1],s[2],s[3],s[4],s[5],float(value),s[6])
#         write_influx('Romania','bucuresti','bucuresti','bucuresti','test-zone','alexbarbu2',float(25),'type1')
#     except Exception as ex:
# 	print ex
    
def injectIntoInflux():
    
    print("Inject into influx")
    
    value=float(random.uniform(0, 1)*50)
    print('sensor2','alexbarbu2','type1',value)
    write_influx('Romania','constanta','constanta','constanta','test-zone','sensor2','alexbarbu2','type1',value)
    value=float(random.uniform(0, 1)*50)
    print('sensor1','alexbarbu2','type2',value)
    write_influx('Romania','constanta','constanta','constanta','test-zone','sensor1','alexbarbu2','type2',value)
    value=float(random.uniform(0, 1)*50)
    print('sensor17','alexbarbu2','type2',value)
    write_influx('Romania','constanta','constanta','constanta','test-zone','sensor17','alexbarbu2','type2',value)
    value=float(random.uniform(0, 1)*50)
    print('sensor18','alexbarbu2','type1',value)
    write_influx('Romania','constanta','constanta','constanta','test-zone','sensor18','alexbarbu2','type1',value)
    value=float(random.uniform(0, 1)*50)
    print('sensor19','alexbarbu2','type3',value)
    write_influx('Romania','constanta','constanta','constanta','test-zone','sensor19','alexbarbu2','type3',value)
    value=float(random.uniform(0, 1)*50)
    print('sensor22','alexbarbu2','type4',value)
    write_influx('Romania','constanta','constanta','constanta','test-zone','sensor22','alexbarbu2','type4',value)
    
    print()
    
while True:
  localtime = time.localtime()
  result = time.strftime("%I:%M:%S %p", localtime)
  print(result)
  if(result[6:8] == '00'):
    injectIntoInflux()
  time.sleep(1)

# client = mqtt.Client("test-sub")
# client.on_connect = on_connect
# client.on_message = on_message
# client.username_pw_set('tester', '123')
# client.tls_set('/etc/vernemq/certs/vernemq.crt',tls_version=ssl.PROTOCOL_TLSv1_2)
# client.tls_insecure_set(True)

# client.connect("anysensor.dasstec.ro", 8883, 60)

#client.loop_forever() #start loop to process received messages

# print("Subscribing...")

#client.publish("ionvalley/management/sensor",'{"action":"get_config"}')#publish

# client.loop_forever() 
