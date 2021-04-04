// const firebase = require('firebase-admin')
const minify = require('imagemin')
const express = require('express')

const app = express()

app.get('/', (_, res) => {res.end("Success")})

app.post('/')

app.listen(3000)