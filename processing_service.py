
import os
import logging
import time
import datetime
import random

from google.appengine.ext import ndb


class Policy(ndb.Model):
  policy_id = ndb.StringProperty(required=True)
  nickname = ndb.StringProperty()
  last_entered = ndb.DateTimeProperty(auto_now=True)

# from google.appengine.ext import ndb

def get_safe(o_dict, o_key, default_value):

  try:
    if (type(o_dict) is dict
          and  o_key in o_dict):
      return str(o_dict[o_key]);

  except:
    pass
  return default_value;


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

  def update_policy(self, user_id, policy_input):
    policy_info = Policy(
          policy_id =  get_safe(policy_input, 'policy_id', 'policy-id-' + str(datetime.datetime.utcnow())),
          nickname = get_safe(policy_input, 'nickname', 'nickname-' + str(datetime.datetime.utcnow()))
          )
    policy_info.put()
    return service_helper(True, "201", {
            'policy_id': policy_info.policy_id,
            'nickname': policy_info.nickname,
            'last_entered': policy_info.last_entered.strftime("%Y-%m-%d %H:%M:%S")
          })

  def get_policies(self, user_id):
    query = Policy.query().order(-Policy.last_entered)
    policies_list = []
    policies_result = query.fetch(5);
    for policy_info in policies_result:
      policy_entry = {
            'policy_id': policy_info.policy_id,
            'nickname': policy_info.nickname,
            'last_entered': policy_info.last_entered.strftime("%Y-%m-%d %H:%M:%S")
      }
      policies_list.append(policy_entry);

    return service_helper( True, 200, {
      'version': self.__service_version,
      'list': policies_list
    })
