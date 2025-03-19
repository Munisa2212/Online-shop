const express = require('express')
const app = express()
const { connectDB } = require('./config/db')
const UserRoute = require('./routes/user.route')
const ProductRoute = require('./routes/product.route')
const RegionRoute = require('./routes/region.route')
const CategoryRoute = require("./routes/category.route")
const OrderRoute = require("./routes/order.route")
const CommentRoute = require("./routes/comment.route")
const winston = require("winston")

connectDB()

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

app.use(express.json())
app.use('/user', UserRoute)
app.use('/product', ProductRoute)
app.use('/region', RegionRoute)
app.use('/category', CategoryRoute)
app.use('/order', OrderRoute)
app.use('/comment', CommentRoute)


app.listen(3000, () => console.log('server is running on port 3000'))
