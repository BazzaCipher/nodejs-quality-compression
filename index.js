const firebase = require('firebase-admin')
const jpegP = require('imagemin-jpegtran')
const pngP = require('imagemin-pngquant')
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const auth = require('./token')
const imagemin = require('imagemin')
const shorthash = require('shorthash')

const app = express()
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
    const fn = shorthash.unique(req.headers['x-firebase-token'])
    const fna = shorthash.unique(req.headers['x-firebase-token'] + ext)
    const fp = `./temp/${fn}.${ext}`
    const fpa = `./temp/${fna}.${ext}`
    
    fs.writeFileSync(fp, req.file.buffer, /*{ encoding: ext }*/)

    imagemin(fp, fpa, {
        use: [
            pngP(),
            jpegP()
        ]
    })

    res.end()
})

// Heroku sets the PORT environment variable
app.listen(process.env.PORT || 3000)