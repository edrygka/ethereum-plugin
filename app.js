const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./logger')
const config = require('./config/config.js')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))

require('./routes')(app)

app.listen(config.port, () => {
  logger.info('We are live on ' + config.port)
})











