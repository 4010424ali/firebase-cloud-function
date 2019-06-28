const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

const firebaseConfig = {
  apiKey: 'AIzaSyBaLbXpl0W3Xy8nN5cb_afz0h6jBLgWzM8',
  authDomain: 'reactapp-17329.firebaseapp.com',
  databaseURL: 'https://reactapp-17329.firebaseio.com',
  projectId: 'reactapp-17329',
  storageBucket: 'reactapp-17329.appspot.com',
  messagingSenderId: '408523997207',
  appId: '1:408523997207:web:e4f9c4bcd27a367b'
};

// Init the admin app
admin.initializeApp();

const db = admin.firestore();

// init the express app
const app = express();

// init the firebase
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req, res) => {
  db.collection('screams')
    .orderBy('created_at', 'desc')
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamsId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          created_at: doc.data().created_at
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post('/screams', (req, res) => {
  const newScreams = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    created_at: new Date().toISOString()
  };
  db.collection('screams')
    .add(newScreams)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'Something went wrong' });
      console.error(err);
    });
});

// function to check string empty
const isEmpty = str => {
  if (str.trim() === '') {
    return true;
  } else {
    return false;
  }
};

//  check the email address or not
const isEmail = email => {
  const regx = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  if (email.match(regx)) {
    return true;
  } else {
    return false;
  }
};

// Signup Route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  // Validate the data
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = 'Email must not be empty';
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Enter the valid the email';
  }

  if (isEmpty(newUser.password)) {
    errors.password = 'Password must not be empty';
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = 'password must match';
  }

  if (isEmpty(newUser.handle)) {
    errors.handle = 'Handle must not be empty';
  }

  // Check the object is empty or not
  // If Object is empty then you are good to go
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'This handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        emmail: newUser.email,
        created_at: new Date().toISOString(),
        userId: userId
      };
      return db.doc(`users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email already use' });
      } else {
        res.status(500).json({ error: err.code });
      }
    });
});

// Login Route
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};
  if (isEmpty(user.email)) {
    errors.email = 'must not be empty';
  }
  if (isEmpty(user.password)) {
    errors.email = 'must not be empty';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(Token => {
      return res.json({ Token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        res.status(400).json({ genral: 'Wrong Condentails, please try again' });
      } else {
        res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.https.onRequest(app);
