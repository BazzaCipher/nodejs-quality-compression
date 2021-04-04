const firebase = require('firebase-admin')
const { writeFileSync } = require('fs')

writeFileSync("/app/creds.json", process.env.GOOGLE_CREDENTIALS, 'utf8')

firebase.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://hackiethon-food-photo-journal.firebaseio.com'
});

// Firebase token verification function
// Usage: app.get('/', verifyToken, (req, res) => {...})
function verifyToken(req, res, next) {
    let token = req.get('X-Firebase-Token')
    admin.auth().verifyIdToken(token).then(decoded => {
        req.firebaseUserId = decoded.uid
        next()
    }).catch(() => {
        res.status(403).send('Invalid authentication')
    })
}

module.exports = { verifyToken }