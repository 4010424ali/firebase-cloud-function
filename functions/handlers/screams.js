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
