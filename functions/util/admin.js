const admin = require('firebase-admin');

// Init the admin app
admin.initializeApp();

const db = admin.firestore();

module.exports = { admin, db };
