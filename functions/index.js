const functions = require('firebase-functions');
const express = require('express');

const {
  getAllScreams,
  getOneScream,
  getScream,
  commentsOnScream
} = require('./handlers/screams');
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthecateUser
} = require('./handlers/users');
const FBAuth = require('./util/FBAuth');

// init the express app
const app = express();

//Screams Route
app.get('/screams', getAllScreams);
app.post('/screams', FBAuth, getOneScream);
app.get('/scream/:screamId', getScream);

// TODO: delete scream
// TODO: like the scream
// TODO: unlike the scream
app.post('/scream/:screamId/comments', FBAuth, commentsOnScream);

// Signup Route
app.post('/signup', signup);

// User Login
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthecateUser);

exports.api = functions.https.onRequest(app);
