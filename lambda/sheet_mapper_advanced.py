import logging
import boto3
from datetime import datetime, timedelta

import urllib3
http = urllib3.PoolManager()

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

def upload(csv, filename, dry_run):
  if dry_run:
    print(csv)
  else:
    s3 = boto3.resource('s3')
    response = s3.Object('<Name of your bucket goes here!>', filename).put(
      Body=csv,
      ContentType='text/csv',
      ACL='public-read',
      Expires=(datetime.now() + timedelta(hours=6)))
    log.info(response)

def get_sheet() -> str:
  log.info('\nget_sheet')
  response = http.request('GET',
    '<Link to your shared spreadsheet goes here!>')
                     
  if response.status != 200:
    log.error('ERROR\tResponse code %d received', response.status)
    return ""                    

  log.info('\nsuccess! get_sheet')

  return response.data
  

def lambda_handler(event, context):
    the_sheet = get_sheet()
    if the_sheet != "":
      upload(the_sheet, '<Name of your cached sheet goes here!>', None)
