const firebase = require('firebase-admin')
const { writeFileSync } = require('fs')

// The Firebase Admin SDK requires that credentials are stored in a JSON file.
// The app is deployed to Heroku without changes from the git repo, so we can
// only store private data in env vars. Therefore at startup, we need to copy
// the data from the env var to a file.
writeFileSync("/app/creds.json", process.env.GOOGLE_CREDENTIALS, 'utf8')

// Firebase token verification function
// Usage: app.get('/', verifyToken, (req, res) => {...})
// Adds the property firebaseUserId to req, as this is used as the DB key
function verifyToken(req, res, next) {
    let token = req.get('X-Firebase-Token')
    firebase.auth().verifyIdToken(token).then(decoded => {
        req.firebaseUserId = decoded.uid
        next()
    }).catch(() => {
        res.status(403).send('Invalid authentication')
    })
}

module.exports = { verifyToken }