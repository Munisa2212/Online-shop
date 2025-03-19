const { roleMiddleware } = require("../middleware/roleAuth")
const { Order } = require("../models/index.module")
const { Order_item, Order_item_Validation } = require("../models/order_item.module")

const app = require("express").Router()

app.post("/order-products", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const user_id = req.user.id
    const {product_id, count} = req.body
    try {
        let { error } = Order_item_Validation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const order = await Order.create({user_id})
        
        for (const element of product_id) {
            await Order_item.create({ order_id: order.id, product_id: element, count });
        }

        const data = await Order_item.findAll();
        res.send(data);
    } catch (error) {
        res.status(500).send(error)
    }
})

app.delete("/order-delete/:id", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Order.findByPk(id)
        if (!data) {
            return res.status(404).send({ message: "Order not found" });
        }
        await data.destroy()
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/",roleMiddleware(["admin"]), async(req, res)=>{
    const user_id = req.user.id
    try {
        const data = await Order.findAll({
            where: { user_id },
            include: [{ model: Order_item , attributes: ["user_id"]}],
        });
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.put("/:id", roleMiddleware(["super-admin"]), async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Order.findByPk(id)
        await data.update(req.body)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})
module.exports = app