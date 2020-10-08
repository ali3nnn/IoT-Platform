import requests
import json
from email.header    import Header
from email.mime.text import MIMEText
from smtplib         import SMTP_SSL
import mysql.connector
from mysql.connector import Error
import time

time.sleep(5)

print("start")

try:
    connection = mysql.connector.connect(user='daemonalerts', password='DasstecB2B',host="89.39.209.2",port='3306',database='anysensor', auth_plugin='mysql_native_password') 
    cursor = connection.cursor()  

    url = '/api/get-last-value'

    result = requests.get(url)
    json_result = result.json()

    def extractVal(json):
        try:
            return json['username']
        except KeyError:
            return 0

    json_result.sort(key = extractVal)
  
    user_old = ''
    user_new = ''
    old_email = ''
    new_email = ''
    mail_msg = ''
    var = 0

    sensors_list = []
    length = len(json_result)
    # length += 1

    sql_select_sensors = "select * from alerts"
    cursor.execute(sql_select_sensors)
    sensors = cursor.fetchall()

    for sensor in sensors:
        sensors_list.append(sensor)

    while True:
        for i in range(length):
            if (json_result[i]['type'] != 'counter'):
                element = json_result[i]
                sql_select_email_of_user= "select email from users where username = %s"
                username = (element['username'], )
                cursor.execute(sql_select_email_of_user, username)
                email = cursor.fetchall()
                user_new = element['username']
                new_email = email[0][0]   

                var = 0
                for sensor in sensors_list:
                    if (element['sensorQueried'] == sensor[0]):
                        var = 1       

                if (user_old != user_new and (user_old != '' and user_new != '' and mail_msg != '')):
                    msg = MIMEText(mail_msg, 'plain', 'utf-8')
                    msg['Subject'] = Header("SENSOR(S) ALERT", 'utf-8')
                    msg['From'] = 'dasstec123456@gmail.com'
                    msg['To'] = old_email         

                    s = SMTP_SSL('smtp.gmail.com', 465, timeout=10)
                    try:
                        s.login('dasstec123456@gmail.com', '123Dasstec456')
                        s.sendmail(msg['From'], msg['To'], msg.as_string())
                    finally:
                        s.quit()

                    mail_msg = ''

                if (var == 1):
                    sql_select_sensor_minmax = "select min from alerts where sensorId = %s"
                    sensorId = (element['sensorQueried'], )
                    cursor.execute(sql_select_sensor_minmax, sensorId)
                    minimum = cursor.fetchall()

                    sql_select_sensor_minmax = "select max from alerts where sensorId = %s"
                    sensorId = (element['sensorQueried'], )
                    cursor.execute(sql_select_sensor_minmax, sensorId)
                    maximum = cursor.fetchall()

                    if (element['value'] > maximum[0][0]):
                        mail_msg = mail_msg + '\n' + element['sensorQueried'] + ' in country ' + element['country'] + ' county ' + element['county'] + ' city ' + element['city'] + ' and zone ' + element['zone'] + ' with value ' + str(element['value']) + ' -> MAX VALUE ALERT'
                    else:
                        if (element['value'] < minimum[0][0]):
                            mail_msg = mail_msg + '\n' + element['sensorQueried'] + ' in country ' + element['country'] + ' county ' + element['county'] + ' city ' + element['city'] + ' and zone ' + element['zone'] + ' with value ' + str(element['value']) + ' -> MIN VALUE ALERT'

                if (i == length - 1 and user_old != user_new and (user_old != '' and user_new != '' and mail_msg != '')):
                    msg = MIMEText(mail_msg, 'plain', 'utf-8')
                    msg['Subject'] = Header("SENSOR(S) ALERT", 'utf-8')
                    msg['From'] = 'dasstec123456@gmail.com'
                    msg['To'] = new_email         

                    s = SMTP_SSL('smtp.gmail.com', 465, timeout=10)
                    try:
                        s.login('dasstec123456@gmail.com', '123Dasstec456')
                        s.sendmail(msg['From'], msg['To'], msg.as_string())
                    finally:
                        s.quit()
                
                user_old = user_new
                old_email = new_email
	print("while")
        time.sleep(60)        

except Exception as ex:
    print (ex)


