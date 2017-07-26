
import os
import logging
import time
import datetime
import random
# from google.appengine.ext import ndb

def service_helper(success, status, payload):
  logical_success = False
  if success:
    logical_success = True
  return {
    'success': logical_success,
    'status': str(status),
    'payload': payload
  }

class ProcessingService(object):

  def __init__(self, service_version):
    self.__service_version = str(service_version)

  def update_policy(self, user_id, policy_info):
    policy_info['owner'] = user_id
    return service_helper(True, "201", {
            'policy_id': '1',
            'nickname': 'nick1',
            'last_entered': '2017-01-01 10:10:10'
          })


  def get_policies(self, user_id):
    if (random.randint(1, 10) >= 4):
      return service_helper( True, 200, {
        'version': self.__service_version,
        'list': [
          {
            'policy_id': '1',
            'nickname': 'nick1',
            'last_entered': '2017-01-01 11:11:11'
          },
          {
            'policy_id': '2',
            'nickname': 'nick2',
             'last_entered': '2017-01-01 09:09:09'
          },
          {
            'policy_id': '3',
            'nickname': 'nick3',
            'last_entered': '2017-01-01 08:08:08'
          },
        ]
      })
    else:
      return service_helper( True, 200, {
        'version': self.__service_version,
        'list': []
      })
