const firebase = require('firebase-admin')
const minify = require('imagemin')
const express = require('express')
const auth = require('./token')

const app = express()

app.enable('trust proxy')

app.get('*', (_, res) => {res.end()})

app.get('/', (_, res) => {res.end("Success")})

app.post('/', auth.verifyToken, (req, res) => {
    // Do stuff to the data
    if (req.headers['content-type'] !== 'multipart/form-data') {
        return res.end()
    }

    console.log(req.statusCode)
    console.log(req.body)
    res.end('success')
})

// Heroku sets the PORT environment variable
app.listen(process.env.PORT || 3000)