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

import webapp2
from urlparse import urlparse


class RestHandler(webapp2.RequestHandler):
  def get(self):
    parsedUrl = urlparse(self.request.url)
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(parsedUrl.path)

  def post(self):
    parsedUrl = urlparse(self.request.url)
    self.response.headers['Content-Type'] = 'application/json'
    self.response.write(parsedUrl.path)


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
