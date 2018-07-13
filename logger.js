const Winston = require('winston')

const logger = Winston.createLogger({
    level: 'debug',
    transports: [
        new Winston.transports.Console({
            timestamp: true
        }),
        new Winston.transports.File({
            filename: 'api.log',
            timestamp: true
        })
    ]
})

module.exports = logger