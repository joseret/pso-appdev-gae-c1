# coding=utf-8
# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import sys

import json
import logging
import requests
import webapp2
from urlparse import urlparse

from services.processing_service import ProcessingService

import google
if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
  # Production, no need to alter anything
  pass
else:
  # Local development server
  google.__path__.pop(0)  # remove /home/<username>/.local/lib/python2.7/site-packages/google
  # logging.warning(google.__path__)  # to inspect the final __path__ of module google

google.__path__.append('./lib/google')
import google.oauth2.id_token
import google.auth.transport.requests

import requests_toolbelt.adapters.appengine
requests_toolbelt.adapters.appengine.monkeypatch()
HTTP_REQUEST = google.auth.transport.requests.Request()

import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth as firebase_auth


if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
  # Production, no need to alter anything
  try:
    default_app = firebase_admin.get_app()
  except:
    default_app = firebase_admin.initialize_app()
else:
  # Local development server
  cred = credentials.Certificate('localonly/pso-appdev-cs-1-2a4c1ef76af6.json')
  try:
    default_app = firebase_admin.get_app()
  except:
    default_app = firebase_admin.initialize_app(cred)

def getHeader(key, headers):
  print 'getAuthHeader', headers.items()
  try:
      for header in headers.items():
          print 'header', header, len(header)
          if len(header) > 1:
            if header[0] == key:
              return header[1]
      print 'getAuthHeader', None
  except:
      return None
  return None


def getAuthInfo(request):
  value = getHeader('Authorization', request.headers)
  if value and len(value.split(' ')) > 1:
    id_token = value.split(' ').pop()
    if (id_token != 'undefined'):
      claims = google.oauth2.id_token.verify_firebase_token(id_token, HTTP_REQUEST)
      if not claims:
         return {'auth': False, 'info': id_token, 'step': 'claims'}

      decoded_token = firebase_auth.verify_id_token(id_token)
      if not decoded_token:
        return {'auth': False, 'info': id_token, 'step': 'firebase_decoded'}

      return { 'auth' : True, 'info': decoded_token, 'step': 'success'}
    return { 'auth' : False, 'info': None}
  else:
    return { 'auth' : False, 'info': None}

def getClaimsFromToken(request, response):
  result = getAuthInfo(request)
  if (not type(result) is dict) or  (not 'auth' in result):
    logging.error("Auth Check not returning appropriate dict - key = auth")
    response.status = '500 - Unexpected Error'
    return None
  if not result['auth']:
    logging.warning("Auth Check for token failed - [{0}]", result)
    response.status = '401 - Unauthorized Error'
    return None
  return result

class RestHandler(webapp2.RequestHandler):
  def get(self):
    try:
      if not getClaimsFromToken(self.request, self.response):
        return
      parsedUrl = urlparse(self.request.url)
      ps = ProcessingService('V1.0.0')
      if parsedUrl.path == '/rest/policy':
        result =  ps.get_policies("jose")
        if (type(result) == dict and
              'success' in result):

          if result['success']:
            self.response.headers['Content-Type'] = 'text/json'
            self.response.status = result['status']
            self.response.write(json.dumps(result['payload']))
          else:
            self.response.headers['Content-Type'] = 'text/json'
            self.response.status = result['status']
          return
    except Exception as e:
      logging.error(e)

    self.response.headers['Content-Type'] = 'application/json'
    self.response.status = '500 - Unexpected Error'

  def post(self):
    try:
      if not getClaimsFromToken(self.request, self.response):
        return

      parsedUrl = urlparse(self.request.url)

      json_data = json.loads(self.request.body)
      ps = ProcessingService('V1.0.0')
      if parsedUrl.path == '/rest/policy':
        result =  ps.update_policy("jose", json_data)
        if (type(result) == dict and
              'success' in result):

          if result['success']:
            self.response.headers['Content-Type'] = 'text/json'
            self.response.status = result['status']
            self.response.write(json.dumps(result['payload']))
          else:
            self.response.headers['Content-Type'] = 'text/json'
            self.response.status = result['status']
          return
    except Exception as e:
      logging.error(e)

    self.response.headers['Content-Type'] = 'application/json'
    self.response.status = '500 - Unexpected Error'


class PrivatePageHandler(webapp2.RequestHandler):
  def get(self):
    parsedUrl = urlparse(self.request.url)
    self.response.headers['Content-Type'] = 'text/html'
    self.response.write(parsedUrl.path)

  def post(self):
    parsedUrl = urlparse(self.request.url)
    self.response.headers['Content-Type'] = 'text/html'
    self.response.write(parsedUrl.path)

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write(u"<body style=\'background-color: green\'>Órale, México - Spinnaker (and Webhook!) - GNP!</body>")


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/private/.*', PrivatePageHandler),
    ('/rest/.*', RestHandler),
], debug=True)
