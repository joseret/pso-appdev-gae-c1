/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
  // this.checkSetup();
  this.submitButton = document.getElementById('submit');
  this.submitButton.addEventListener('click', this.submitButtonAction.bind(this));
  this.submitButton.removeAttribute('disabled')
  // this.initFirebase();
}

// // Sets up shortcuts to Firebase features and initiate firebase auth.
// FriendlyChat.prototype.initFirebase = function() {
//   // TODO(DEVELOPER): Initialize Firebase.
// };

FriendlyChat.prototype.getInfo = function() {
  var self = this;
  var userIdToken = this.userIdToken;
  $.ajax('/rest/policy', {
  /* Set header for the XMLHttpRequest to get data from the web server
  associated with userIdToken */
    headers: {
      'Authorization': 'Bearer ' + userIdToken
    },
    'type': 'get',
    'dataType': 'json',
    'success': function(json_data) {
      console.log('JSON-Success', json_data)
      if ( json_data['list'] && json_data['list'].length > 0 ) {
        console.log('list', json_data['list']);
        $("#messages").empty();
        for(var o in json_data['list']) {
          console.log('list_entry', o);
          var innerInfo = $('<div  style="padding-bottom: 10px"  />');
          innerInfo.append( $('<span style="padding-right: 10px" />').text('Numero'));
          innerInfo.append( $('<span style="padding-right: 10px" />').text(json_data['list'][o]['policy_id']));
          $("#messages").append(innerInfo);
          var innerInfo = $('<div  style="padding-bottom: 10px"  />');
          innerInfo.append( $('<span style="padding-right: 10px" />').text('Nombre'));
          innerInfo.append( $('<span style="padding-right: 10px" />').text(json_data['list'][o]['nickname']));
          $("#messages").append(innerInfo);
        }
      } else {
        $("#messages").empty();
        $("#messages").append($('<div  style="padding-bottom: 10px"  />').text("Ninguna Poliza"));
      }
    },
    'error': function(error) {
        console.error('submitButtonAction error in post', error);
    },
  });
}

FriendlyChat.prototype.submitButtonAction = function() {
    var userIdToken = this.userIdToken;
    console.log('submitButtonAction', userIdToken);
    var self = this;
    $.ajax('/rest/policy', {
    /* Set header for the XMLHttpRequest to get data from the web server
    associated with userIdToken */
    headers: {
      'Authorization': 'Bearer ' + userIdToken
    },
    'data': JSON.stringify({'prop': 'value'}),
    'type': 'post',
    'dataType': 'json',
    'success': function(json_data) {
      console.log('JSON-Success', json_data)
      $('#messages-bottom').text("Actualizado")
        .css("display","block").fadeOut(2000);
      self.getInfo();
    },
    'error': function(error) {
        console.error('submitButtonAction error in post', error);
    },
  });
};

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';


// // Checks that the Firebase SDK has been correctly setup and configured.
// FriendlyChat.prototype.checkSetup = function() {
//   if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
//     window.alert('You have not configured and imported the Firebase SDK. ' +
//         'Make sure you go through the codelab setup instructions and make ' +
//         'sure you are running the codelab using `firebase serve`');
//   }
// };

$(function(){
  window.friendlyChat = new FriendlyChat();
});
