const { roleMiddleware } = require("../middleware/roleAuth")
const { Order } = require("../models/order.module")

const app = require("express").Router()

app.post("/order", async(req,res)=>{
    const user_id = req.user.id
    const order = await Order.create({user_id})
})




module.exports = app