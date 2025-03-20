const { roleMiddleware } = require("../middleware/roleAuth");
const { Order, User } = require("../models/index.module");
const { Order_item, Order_item_Validation } = require("../models/order_item.module");
const { orderLogger } = require("../logger");
const express = require("express");
const app = express.Router();

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
 *     summary: Create an order with multiple products
 *     description: Allows admin and seller roles to create an order with multiple products.
 *     tags:
 *       - Order
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - count
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     count:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
app.post("/order-products", roleMiddleware(["admin", "seller"]), async (req, res) => {
    const user_id = req.user.id;
    const { products } = req.body;
    try {
        let { error } = Order_item_Validation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const order = await Order.create({ user_id });
        
        for (const element of products) {
            await Order_item.create({ order_id: order.id, product_id: element.product_id, count: element.count });
        }

        orderLogger.log("info", "Order created successfully");
        res.send({ message: "Order created successfully", order });
    } catch (error) {
        orderLogger.log("error", "Order post error", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

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
app.delete("/order-delete/:id", roleMiddleware(["admin", "seller"]), async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }
        await order.destroy();
        orderLogger.log("info", `Order with ID ${id} deleted successfully`);
        res.send({ message: "Order deleted successfully" });
    } catch (error) {
        orderLogger.log("error", "Order delete error", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

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
app.get("/", roleMiddleware(["admin", "user", "super-admin", "seller"]), async (req, res) => {
    const user_id = req.user.id;
    try {
        const orders = await Order.findAll({
            where: { user_id },
            include: [{ model: Order_item, attributes: ["count"] }, { model: User, attributes: ["username"] }],
        });
        res.send(orders);
    } catch (error) {
        orderLogger.log("error", "Order get error", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /order/{id}:
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
app.patch("/:id", roleMiddleware(["super-admin"]), async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).send({ message: "Order not found" });
        }
        await order.update(req.body);
        orderLogger.log("info", `Order with ID ${id} updated successfully`);
        res.send({ message: "Order updated successfully", order });
    } catch (error) {
        orderLogger.log("error", "Order update error", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

module.exports = app;
