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
  this.checkSetup();
  this.signInButton = document.getElementById('sign-in');
  this.signInButton.addEventListener('click', this.signInWithPopup.bind(this));

  this.submitButton = document.getElementById('submit');

  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signOutButton = document.getElementById('sign-out');
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  this.submitButton = document.getElementById('submit');
  this.submitButton.addEventListener('click', this.submitButtonAction.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // TODO(DEVELOPER): Initialize Firebase.
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  // this.database = firebase.database();
  // this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

FriendlyChat.prototype.onAuthStateChanged = function(user) {

  if (user) { // User is signed in!
    console.log('user', user);
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Only change these two lines!
    var userName = user.displayName;
    var self = this;

    firebase.auth().currentUser.getToken(/* forceRefresh */ true).then(function(idToken) {
      console.log('getToken', idToken, user);
      self.userIdToken = idToken;
    }).catch(function(error) {
      self.useridToken = null;
      console.error('Error getting the logged in user token', user, error);
    });
    user.getToken().then(function(idToken) {
      console.log('getToken', idToken, user);
      self.userIdToken = idToken;
    });
    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');
     // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    this.submitButton.removeAttribute('disabled')


  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.idUserToken = null;
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
    this.submitButton.removeAttribute('disabled')


  }
};

FriendlyChat.prototype.signInWithPopup = function() {
  window.open(this.getWidgetUrl(), 'Autenticar', 'width=1100,height=735');
};

/**
 * @return {string} The URL of the FirebaseUI standalone widget.
 */
FriendlyChat.prototype.getWidgetUrl = function()  {
  return '/static/widget.html';
};


// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Sign out of Firebase.
  console.log('signOut');

  this.auth.signOut();
  this.userIdToken = "";
};

FriendlyChat.prototype.getInfo = function() {
  var self = this;
  var userIdToken = this.userIdToken;
  $.ajax('/rest/policy', {
  /* Set header for the XMLHttpRequest to get data from the web server
  associated with userIdToken */
    headers: {
      'Authorization': 'Bearer ' + userIdToken
    },
    'data': JSON.stringify({'prop': 'value'}),
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


// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

$(function(){
  window.friendlyChat = new FriendlyChat();
});
