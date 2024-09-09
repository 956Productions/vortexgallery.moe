import yaml
import collections
import subprocess
import csv
import requests

with open('airtable.yml','r') as file:
    config = yaml.safe_load(file)

from airtable import airtable
at = airtable.Airtable(config["base"], config["secret"])

headers = []

rows = []

current_game = ""

def sanitize(value):
    new_val = None
    if type(value) is collections.OrderedDict:
        new_val = str(value.get('url'))
    elif type(value) is list:
        print(value)
        if len(value) == 0:
            new_val = ""
        elif type(value[0]) is collections.OrderedDict:
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

for r in at.iterate('Tournaments',view="viwztcfMm6UNxlAw6"):
    resp_row = r['fields']

    new_row = {}

    for key, value in resp_row.items():

        if key == "Abbr-Game":
            if current_game != key:
                current_game == key

        if key == "":
            pass

        if key not in headers:
            headers.append(key)

        new_row[key] = sanitize(value)

    rows.append(new_row)

with open('games.csv','w',newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file,fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)

subprocess.run('git add -A') 
subprocess.run('git commit -m "automated update" ')
subprocess.run ('git push')