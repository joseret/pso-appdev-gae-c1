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
import webapp2
from urlparse import urlparse

from processing_service import ProcessingService


REST_COMMAND_TYPE = 'policy'
class RestHandler(webapp2.RequestHandler):
  def get(self):
    try:
      parsedUrl = urlparse(self.request.url)
      ps = ProcessingService('V1.0.0')
      if parsedUrl.path == '/rest/' + REST_COMMAND_TYPE:
        result =  ps.get_policies("V1.0.0")
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
      print 'post'
      parsedUrl = urlparse(self.request.url)

      json_data = json.loads(self.request.body)
      ps = ProcessingService('V1.0.0')
      if parsedUrl.path == '/rest/' + REST_COMMAND_TYPE:
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

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write(u"<body style=\'background-color: green\'>Órale, México - Simple App - Stubs) - GNP!</body>")


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/rest/.*', RestHandler),
], debug=True)
