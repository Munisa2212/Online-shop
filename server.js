const express = require('express')
const app = express()
const { connectDB } = require('./config/db')
const UserRoute = require('./routes/user.route')
const ProductRoute = require('./routes/product.route')
const RegionRoute = require('./routes/region.route')
connectDB()

app.use(express.json())
app.use('/user', UserRoute)
app.use('/product', ProductRoute)
app.use('/region', RegionRoute)

app.listen(3000, () => console.log('server is running on port 3000'))
