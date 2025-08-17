import yaml
#import subprocess
import csv
import urllib.request
import os
import requests
import traceback
import sys 
import time

#subprocess.run('git pull',shell=True) 

with open('airtable.yml','r') as file:
    config = yaml.safe_load(file)

from pyairtable import Api
at = Api(config["secret"])

drop_headers = ['Form Base URL','Record ID','Form Prefill URL','Edit']

def sanitize(value):
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

def create_rules_data(dl_images=True,atbase=config["onlinebase"],atview="viwztcfMm6UNxlAw6",filename="games.csv",subdir=None,label=None,template=None):
    table = at.table(atbase,"Tournaments")

    headers = []
    rows = []

    if template != None:
        clear_game_pages(subdir)

    for r in table.all(view=atview):
        resp_row = r['fields']

        new_row = {}

        for key, value in resp_row.items():
            if key not in drop_headers:
                if key not in headers:
                    headers.append(key)
                new_row[key] = sanitize(value)

        rows.append(new_row)
        if 'Format-Rollup' in new_row:
            new_row['Game Name'] = new_row['Game Name'] + " " + new_row['Format-Rollup']

        if dl_images is True:
            if os.path.isfile('./img/games/' + new_row['Abbr-Game'] + '.png'):
                os.remove('./img/games/' + new_row['Abbr-Game'] + '.png')
            urllib.request.urlretrieve(new_row['Img-Game Logo'], './img/games/' + new_row['Abbr-Game'] + '.png')
            time.sleep(0.1)

        #write site page
        if template != None:
            generate_game_page(subdir,new_row['Game Name'],label,new_row['Abbr-Game'],template)

    if os.path.isfile('./_data/%s' % filename):
        if os.path.isfile('./_data/%s.bak' % filename):
            os.remove('./_data/%s.bak' % filename)
        os.rename('./_data/%s' % filename,'./_data/%s.bak' % filename)

    with open('./_data/%s' % filename,'w',newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file,fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)

def create_schedule_data():
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

def clear_game_pages(subdir="vgon25"):
    subdir = 'events/' + subdir
    if os.path.exists(subdir):
        for f in os.listdir(subdir):
            if os.path.isfile(os.path.join(subdir,f)):
                #print(os.path.join(subdir,f))
                os.remove(os.path.join(subdir,f))

def generate_game_page(subdir,name,label,abbr,template):
    if not os.path.exists('events/' + subdir):
        os.mkdir('events/' + subdir)
    with open(os.path.join('events/' + subdir,"%s.md" % abbr),'w') as f:
        content = '---\ntitle: "%s (%s)"\npermalink: /%s/%s\ngame: "%s"\ngame_name: "%s"\nevent: "%s"\nlayout: %s\n---' % (name,subdir.upper(),subdir,abbr,abbr,name,label,template)
        f.write(content)

        
try:
    if len(sys.argv) > 0:
        if "--skip-images" in sys.argv:
            # create_rules_data(dl_images=False) #VGOn
            # create_rules_data(dl_images=False,atbase=config["frostybase"],atview="viwYz0OiXYg2cNuoF",filename="frosty.csv",subdir="ffxvii",label="Vortex Gallery x FFXVII",template="game_ff25")
            create_rules_data(dl_images=False,atbase=config["onlinebase"],atview="viwYz0OiXYg2cNuoF",filename="games.csv",subdir="vgon25",label="Vortex Gallery Online 2025",template="game_vgon25")
        else:
            # create_rules_data(dl_images=True) #VGFF25
            create_rules_data(dl_images=True,atbase=config["onlinebase"],atview="viwYz0OiXYg2cNuoF",filename="games.csv",subdir="vgon25",label="Vortex Gallery Online 2025",template="game_vgon25")
    # create_schedule_data()
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