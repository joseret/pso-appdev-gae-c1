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


  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.idUserToken = null;
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');

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
  this.auth.signOut();
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
