const functions = require('firebase-functions');
const express = require('express');

const { getAllScreams, getOneScream } = require('./handlers/screams');
const { signup, login, uploadImage } = require('./handlers/users');
const FBAuth = require('./util/FBAuth');

// init the express app
const app = express();

app.get('/screams', getAllScreams);
app.post('/screams', FBAuth, getOneScream);

// Signup Route
app.post('/signup', signup);

// Login Route
app.post('/login', login);

//upload the image on the firebase
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
