import yaml
#import subprocess
import csv
import urllib.request
import os
import requests
import traceback
import sys 
import time, datetime
from zoneinfo import ZoneInfo

#subprocess.run('git pull',shell=True) 

with open('airtable.yml','r') as file:
    config = yaml.safe_load(file)

from pyairtable import Api
at = Api(config["secret"])

drop_headers = ['Form Base URL','Form Prefill URL','Edit']

def sanitize_input(value):
    new_val = None
    if isinstance(value,dict):
        new_val = str(value.get('url'))
    elif type(value) is list:
        if len(value) == 0:
            new_val = ""
        elif isinstance(value[0],dict):
            new_val = str(value[0].get('url'))
        elif len(value) > 1:
            new_string = ""
            c = 0
            for item in value:
                new_string += str(item)
                if c < len(value) - 1:
                    new_string += ", "
                    c += 1
            new_val = new_string
        else:
            new_val = value[0]
    else:
        new_val = str(value)
    return new_val

def download_game_logo(filename,url):
    if os.path.isfile('./img/games/' + filename + '.png'):
        os.remove('./img/games/' + filename + '.png')
    urllib.request.urlretrieve(url, './img/games/' + filename + '.png')

def clear_game_pages(subdir="vgon25"):
    subdir = 'events/' + subdir
    if os.path.exists(subdir):
        for f in os.listdir(subdir):
            if os.path.isfile(os.path.join(subdir,f)):
                os.remove(os.path.join(subdir,f))

def generate_game_page(subdir,name,label,abbr):
    if not os.path.exists('events/' + subdir):
        os.mkdir('events/' + subdir)
    with open(os.path.join('events/' + subdir,"%s.md" % abbr),'w') as f:
        content = '---\ntitle: "%s (%s)"\npermalink: /events/%s/%s\ngame: "%s"\ngame_name: "%s"\nevent: "%s"\nlayout: %s/game\n---' % (name,subdir.upper(),subdir,abbr.lower(),abbr,name,label,subdir)
        f.write(content)

def generate_online_schedule(schedule,row,timestamp):
    new_time = datetime.datetime.fromtimestamp(int(timestamp))
    for t in config['schedule']:
        new_time = new_time.astimezone(ZoneInfo(t['zone']))
        data = {
            "Record" : row['Record ID'],
            "Date" :  new_time.strftime("%b %d (%a)"),
            "Time" : new_time.strftime("%I:%M %p"), # Oct 11 (Fri.) 07:00 PM ICT (UTC +7)
            "TZ" : new_time.strftime("%Z (%z)"),
            "Timestamp" : int(timestamp)
        }
        if row['Week #'] not in schedule:
            schedule[row['Week #']] = {}
        if t['label'] not in schedule[row['Week #']]:
            schedule[row['Week #']][t['label']] = []
        schedule[row['Week #']][t['label']].append( data )

def generate_stream_schedule(row):
    if type(row['Abbr-Region']) == list:
        row['Abbr-Region'] = row['Abbr-Region'][0]
    if type(row['Game Name']) == list:
        row['Game Name'] = row['Game Name'][0]
    if type(row['Short Name']) == list:
        row['Short Name'] = row['Short Name'][0]
    if type(row['Abbr-Game']) == list:
        row['Abbr-Game'] = row['Abbr-Game'][0]
    data = {
        "Record" : row['Record ID'],
        "Game" : "[%s] %s" % (row['Abbr-Region'],row['Game Name']),
        "Short" : "[%s] %s" % (row['Abbr-Region'],row['Short Name']),
        "Abbr" : "[%s] %s" % (row['Abbr-Region'],row['Abbr-Game']),
        "Start" : int(row['Time-Start Timestamp']),
        "End" : int(row['Time-End Timestamp']),
        "Stream" : row['Main Stream']
    }
    if 'Format' in row:
        data['Game'] = "[%s] %s %s" % (row['Abbr-Region'],row['Game Name'],row['Format-Rollup'][0]),
        data['Short'] = "[%s] %s %s" % (row['Abbr-Region'],row['Short Name'],row['Format-Rollup'][0]),
        data['Abbr'] = "[%s] %s %s" % (row['Abbr-Region'],row['Abbr-Game'],row['Format-Rollup'][0]),
    return data

def create_rules_data(atbase,atview,subdir,label,dl_images=True,online_schedule=False):
    table = at.table(atbase,"Tournaments")
    headers = []
    rows = []
    clear_game_pages(subdir)

    for r in table.all(view=atview,sort=['Game Name','Time-Start Timestamp']):
        new_row = {}
        for key, value in r['fields'].items():
            if key not in drop_headers:
                if key not in headers:
                    headers.append(key)
                new_row[key] = sanitize_input(value)
        rows.append(new_row)
        if dl_images is True:
            download_game_logo(new_row['Abbr-Game'],new_row['Img-Game Logo'])
            time.sleep(0.1)
        generate_game_page(subdir,new_row['Game Name'],label,new_row['Abbr-Game'])

    if os.path.isfile('./_data/%s/games.csv' % subdir):
        if os.path.isfile('./_data/%s/games.csv.bak' % subdir):
            os.remove('./_data/%s/games.csv.bak' % subdir)
        os.rename('./_data/%s/games.csv' % subdir,'./_data/%s/games.csv.bak' % subdir)

    with open('./_data/%s/games.csv' % subdir,'w',newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file,fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

    if online_schedule == True:
        schedule = {}
        streams = []
        for t in table.all(view=atview,sort=['Time-Start Timestamp','Game Name']):
            new_row = t['fields']
            if 'Time-Start Timestamp' in new_row:
                generate_online_schedule(schedule,new_row,new_row['Time-Start Timestamp'])
            if 'Main Stream' in new_row:
                streams.append(generate_stream_schedule(new_row))
        yaml.dump(schedule,open('./_data/%s/schedule.yml' % subdir,'w'))
        yaml.dump(streams,open('./_data/%s/streams.yml' % subdir,'w'))

def create_schedule_data(): #OUTDATED
    table = at.table(config["onlinebase"],"Tournaments")
    headers = []
    rows = []

    for r in table.all(view="viwSwKAHpaFzm1yHc",sort=['Time-UTC']):
        resp_row = r['fields']
        new_row = {}
        for key, value in resp_row.items():
            if key not in drop_headers:
                if key not in headers:
                    headers.append(key)
                new_row[key] = sanitize_input(value)
        rows.append(new_row)

    if os.path.isfile('./_data/schedule.csv'):
        if os.path.isfile('./_data/schedule.csv.bak'):
            os.remove('./_data/schedule.csv.bak')
        os.rename('./_data/schedule.csv','./_data/schedule.csv.bak')

    with open('./_data/schedule.csv','w',newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file,fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

try:
    if len(sys.argv) > 0:
        dl_image_flag = True
        if "--skip-images" in sys.argv:
            dl_image_flag = False
        for i in config['events']:
            create_rules_data(i['base'],i['rulesview'],subdir=i['subdir'],label=i['label'],dl_images=dl_image_flag,online_schedule=True)
    # create_schedule_data()
except Exception:
    print(traceback.format_exc())
    try:
        pass
        result = requests.post(config["webhook"],json = {"content":"Website data build failed! <@102905092759363584>"})
    except:
        pass

#else:
    #subprocess.run('git add -A',shell=True) 
    #subprocess.run('git commit -m "automated update" ',shell=True)
    #subprocess.run('git push',shell=True)