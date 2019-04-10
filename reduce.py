#!/usr/bin/env python3

import os

from os.path import getmtime
from datetime import datetime

IMAGE_ROOT = 'images'
OUTPUT_FILE = 'memes.csv'

buffer = []
buffer.append('file,year,month,day,weekday,hour,minute,second')

for r, d, f in os.walk(IMAGE_ROOT):
    for file in f:
        mtime = getmtime(r + '/' + file)
        date = datetime.fromtimestamp(mtime)
        csv = '{},{},{},{},{},{},{},{}'.format(file, date.year, date.month, date.day, date.weekday(), date.hour, date.minute, date.second)
        buffer.append(csv)

with open(OUTPUT_FILE, 'w') as output:
    for line in buffer:
        output.write(line + '\n')
