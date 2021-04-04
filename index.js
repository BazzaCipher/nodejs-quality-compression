const firebase = require('firebase-admin')
const jpegP = require('imagemin-jpegtran')
const pngP = require('imagemin-pngquant')
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const auth = require('./token')
const imagemin = require('imagemin')
const crypto = require('crypto')
const { firestore } = require('firebase-admin')

// Initialise firebase
firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    databaseURL: 'https://hackiethon-food-photo-journal.firebaseio.com'
});

const app = express()
const storage = firebase.storage().bucket('gs://hackiethon-food-photo-journal.appspot.com')
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

app.options('/', (req, res) => {
    res.set('Access-Control-Request-Method', 'GET, POST')
    res.set('Access-Control-Allow-Origin', 'https://new-super-mario-bros-2.vercel.app')
    res.set('Access-Control-Allow-Headers', 'X-Firebase-Token, Content-Type')
    res.send()
})

// app.post('/', auth.verifyToken, upload.single('image'), (req, res) => {
app.post('/', auth.verifyToken, express.raw({ limit: "10MB" }), async (req, res) => {
    // Uploaded file is req.file
    // https://github.com/expressjs/multer#file-information
    console.log(req.statusCode)
    console.log(req.body)

    res.set('Access-Control-Allow-Origin', 'https://new-super-mario-bros-2.vercel.app')

    // const ext = req.file.mimetype.split('/').pop()
    const ext = 'imagefile'
    const fn = crypto.createHash('md5').update(req.firebaseUserId + Date.now()).digest('hex')
    const fp = `./temp/${fn}.${ext}`
    const now = Date.now()
    
    fs.writeFileSync(fp, req.body /*{ encoding: ext }*/)

    // Places file at fpa
    let data = await imagemin([fp], {
        destination: 'build',
        plugins: [
            pngP(),
            jpegP()
        ]
    })

    // Upload to physical storage
    storage.upload(data[0].destinationPath, {
        destination: `image/${req.firebaseUserId}/i/${fn}`, 
    })

    db.collection('users').doc(req.firebaseUserId).update(
        new firestore.FieldPath('photos', now.toString()),
        fn,
    )

    let ndata = await db.collection('users').doc(req.firebaseUserId).get()
    let foodimals = ndata.get('foodimals') || []
    let randomFoodimal = Math.floor(Math.random() * 16)
    if (!foodimals.includes(randomFoodimal)) {
        foodimals.push(randomFoodimal)
    }
    await db.collection('users').doc(req.firebaseUserId).update({ foodimals })

    res.end()
})

// Heroku sets the PORT environment variable
app.listen(process.env.PORT || 3000)