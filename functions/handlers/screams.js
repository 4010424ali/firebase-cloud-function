const { db } = require('../util/admin');
exports.getAllScreams = (req, res) => {
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
};

exports.getOneScream = (req, res) => {
  const newScreams = {
    body: req.body.body,
    userHandle: req.user.handle,
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
};

exports.getScream = (req, res) => {
  let screamData = {};

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream is not found' });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection('comments')
        .orderBy('created_at', 'desc')
        .where('screamId', '==', req.params.screamId)
        .get();
    })
    .then(data => {
      screamData.comments = [];
      data.forEach(doc => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// comment on scream
module.exports.commentsOnScream = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ error: 'Comments must not empty' });
  }

  const newComment = {
    body: req.body.body,
    created_at: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(400).json({ error: 'Scream is not found' });
      }
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json({ newComment });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
