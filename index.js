const firebase = require('firebase-admin')
const minify = require('imagemin')
const express = require('express')
const auth = require('./token')
const multer = require('multer')

const app = express()
const upload = multer({
    limits: {
        // Limit images to 10MB to prevent denial of service
        fieldSize: 10 * 1024 * 1024
    }
})

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
    res.end('Success')
})

// Heroku sets the PORT environment variable
app.listen(process.env.PORT || 3000)