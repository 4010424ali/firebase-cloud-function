const functions = require('firebase-functions');
const express = require('express');

const {
  getAllScreams,
  getOneScream,
  getScream,
  commentsOnScream,
  likeScream,
  unlikeScream,
  deleteScream
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
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.post('/scream/:screamId/comments', FBAuth, commentsOnScream);

// User Route
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthecateUser);

exports.api = functions.https.onRequest(app);
