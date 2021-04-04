const minify = require('imagemin')
const express = require('express')

const app = express()

app.enable('trust proxy')

app.get('/', (_, res) => {res.end("Success")})

app.post('/', (req, res) => {

})

// Heroku sets the PORT environment variable
app.listen(process.env.PORT || 3000)