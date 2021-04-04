const firebase = require('firebase-admin')
const jpegP = require('imagemin-jpegtran')
const pngP = require('imagemin-pngquant')
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const auth = require('./token')
const imagemin = require('imagemin')

// Initialise firebase
firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    databaseURL: 'https://hackiethon-food-photo-journal.firebaseio.com'
});

const app = express()
const storage = firebase.storage().ref()
const db = firebase.firestore()
const upload = multer({
    limits: {
        // Limit images to 10MB to prevent denial of service
        fieldSize: 10 * 1024 * 1024
    }
})

// Create temporary folder to hold files in conversion and compression states
fs.mkdirSync('./temp')

// Needed to get the client's IP on Heroku
app.enable('trust proxy')

app.get('/', (_, res) => {
    res.end("Success")
})

app.post('/', auth.verifyToken, upload.single('image'), (req, res) => {
    // Uploaded file is req.file
    // https://github.com/expressjs/multer#file-information
    console.log(req.statusCode)
    console.log(req.body)

    const ext = req.file.mimetype.split('/').pop()
    const fn = crypto.createHash('md5').update(req.firebaseUserId).digest('hex')
    const fna = crypto.createHash('md5').update(req.firebaseUserId + ext).digest('hex')
    const fp = `./temp/${fn}.${ext}`
    const fpa = `./temp/${fna}.${ext}`
    
    fs.writeFileSync(fp, req.file.buffer, /*{ encoding: ext }*/)

    // Places file at fpa
    imagemin(fp, fpa, {
        use: [
            pngP(),
            jpegP()
        ]
    })

    storage.child(`images/${req.firebaseUserId}/i/${fpa}`).put(fs.readFileSync(fpa))

    db.collection('users').doc(req.firebaseUserId).set({photos: [fpa]}, {merge: true})

    res.end()
})

// Heroku sets the PORT environment variable
app.listen(process.env.PORT || 3000)