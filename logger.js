const winston = require("winston")

const logger = winston.createLogger({
    level: "silly",
    format: winston.format.json(),
    transports: [new winston.transports.File({filename: "logs.log"})]
})

let categoryLogger = logger.child({module: "product"})
let commentLogger = logger.child({module: "auth"})
let orderLogger = logger.child({module: "order"})
let productLogger = logger.child({module: "product"})
let regionLogger = logger.child({module: "region"})
let userLogger = logger.child({module: "user"})

module.exports = {categoryLogger, commentLogger, orderLogger, productLogger,regionLogger, userLogger }
