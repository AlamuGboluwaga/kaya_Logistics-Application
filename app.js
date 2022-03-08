const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const kayaPay = require('./src/server')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH, GET, DELETE, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  next()
})

app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 404,
    message: 'not found'
  })
})

kayaPay.SERVER(app)

