const { roleMiddleware } = require("../middleware/roleAuth")
const { Order, User } = require("../models/index.module")
const { Order_item, Order_item_Validation } = require("../models/order_item.module")
const {orderLogger} = require("../logger")
const app = require("express").Router()




/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management
 */

/**
 * @swagger
 * /order/order-products:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - count
 *             properties:
 *               product_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               count:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /order/order-delete/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Get all orders for a user
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * order/{id}:
 *   patch:
 *     summary: Update an order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

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
        orderLogger.log("info", "order created successfully")
        res.send(data);
    } catch (error) {
        res.status(500).send(error)
        orderLogger.log("error", "order post error")
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
        orderLogger.log("info", `order with ${id} deleted successfully`)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
        orderLogger.log("error", "order delete error")
    }
})

app.get("/",roleMiddleware(["admin"]), async(req, res)=>{
    const user_id = req.user.id
    try {
        const data = await Order.findAll({
            where: { user_id },
            include: [{ model: Order_item , attributes: ["count"]}, { model: User , attributes: ["username"]}],
        });
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
        orderLogger.log("error", "order get error")
    }
})

app.patch("/:id", roleMiddleware(["super-admin"]), async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Order.findByPk(id)
        await data.update(req.body)
        orderLogger.log("info", `order with ${id} updated successfully`)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
        orderLogger.log("error", "order update error")
    }
})
module.exports = app