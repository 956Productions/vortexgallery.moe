import yaml
import collections
#import subprocess
import csv
import urllib.request
import os
import requests
import traceback
import sys 

#subprocess.run('git pull',shell=True) 

with open('airtable.yml','r') as file:
    config = yaml.safe_load(file)

from pyairtable import Api
at = Api(config["secret"])

table = at.table(config["base"],"Tournaments")

drop_headers = ['Form Base URL','Record ID','Form Prefill URL','Edit']

def sanitize(value):
    new_val = None
    if isinstance(value,dict):
        new_val = str(value.get('url'))
    elif type(value) is list:
        #print(value)
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

def create_rules_data(dl_images=True):

    headers = []
    rows = []

    for r in table.all(view="viwztcfMm6UNxlAw6"):
        resp_row = r['fields']

        new_row = {}

        for key, value in resp_row.items():
            if key not in drop_headers:
                if key not in headers:
                    headers.append(key)
                new_row[key] = sanitize(value)

        rows.append(new_row)

        if dl_images is True:
            if os.path.isfile('./img/games/' + new_row['Abbr-Game'] + '.png'):
                os.remove('./img/games/' + new_row['Abbr-Game'] + '.png')
            urllib.request.urlretrieve(new_row['Img-Game Logo'], './img/games/' + new_row['Abbr-Game'] + '.png')

    if os.path.isfile('./_data/games.csv'):
        if os.path.isfile('./_data/games.csv.bak'):
            os.remove('./_data/games.csv.bak')
        os.rename('./_data/games.csv','./_data/games.csv.bak')

    with open('./_data/games.csv','w',newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file,fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

def create_schedule_data():

    headers = []
    rows = []

    for r in table.all(view="viwSwKAHpaFzm1yHc",sort=['Time-UTC']):
        resp_row = r['fields']

        new_row = {}

        for key, value in resp_row.items():
            if key not in drop_headers:
                if key not in headers:
                    headers.append(key)
                new_row[key] = sanitize(value)

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
        if "--skip-images" in sys.argv:
            create_rules_data(dl_images=False)
        else:
            create_rules_data(dl_images=True)
    create_schedule_data()
except Exception:
    print(traceback.format_exc())
    try:
        result = requests.post(config["webhook"],json = {"content":"Website data build failed! <@102905092759363584>"})
    except:
        pass
#else:
    #subprocess.run('git add -A',shell=True) 
    #subprocess.run('git commit -m "automated update" ',shell=True)
    #subprocess.run('git push',shell=True)