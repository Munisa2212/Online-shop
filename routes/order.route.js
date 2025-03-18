const { roleMiddleware } = require("../middleware/roleAuth")
const { Order } = require("../models/order.module")
const { Order_item } = require("../models/order_item.module")

const app = require("express").Router()

app.post("/order-products", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const user_id = req.user.id
    const {product_id, count} = req.body
    try {
        const order = await Order.create({user_id})
        
        product_id.forEach(async element => {
            await Order_item.create({order_id: order.id, product_id: element, count})
        });
        res.send(order)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.delete("/order-delete/:id", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Order.findByPk(id)
        await data.destroy()
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

app.get("/",roleMiddleware(["admin"]), async(req, res)=>{
    const user_id = req.user.id
    console.log(user_id)
    try {
        const data = await Order.findAll({
            where: { user_id },
            include: [{ model: Order_item }],
        });
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = app