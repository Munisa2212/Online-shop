const express = require("express");
const { ProductValadation } = require("../models/product.module");
const { Product } = require("../models/index.module");
const { Op } = require("sequelize");
const { roleMiddleware } = require("../middleware/roleAuth");
const { Comment } = require("../models/index.module");

const route = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - count
 *         - price
 *         - image
 *         - author_id
 *         - category_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Name of the product
 *         description:
 *           type: string
 *           description: Product description
 *         count:
 *           type: integer
 *           description: Available stock count
 *         price:
 *           type: number
 *           format: float
 *           description: Product price
 *         image:
 *           type: string
 *           description: Image URL
 *         author_id:
 *           type: integer
 *           description: ID of the product's author (seller)
 *         category_id:
 *           type: integer
 *           description: Category ID
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
route.post("/", roleMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    let { error } = ProductValadation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let newProduct = await Product.create(req.body);
    res.status(201).send(newProduct);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get a list of products with filtering
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Page number (default: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Items per page (default: 10)"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sort field (default: id)"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: "Sort order (default: ASC)"
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: "Filter by product name"
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: "Filter by category"
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: "Minimum price filter"
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: "Maximum price filter"
 *     responses:
 *       200:
 *         description: "List of products"
 *       500:
 *         description: "Server error"
 */

route.get("/", async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sort = "id",
      order = "ASC",
      name,
      category_id,
      min_price,
      max_price,
    } = req.query;

    let where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (category_id) where.category_id = category_id;
    if (min_price && max_price) {
      where.price = { [Op.between]: [min_price, max_price] };
    } else if (min_price) {
      where.price = { [Op.gte]: min_price };
    } else if (max_price) {
      where.price = { [Op.lte]: max_price };
    }

    let products = await Product.findAndCountAll({
      where,
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [{ model: Comment, attributes: ["user_id", "comment"] }],
    });

    res.status(200).send({
      products: products.rows,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
route.get("/:id", async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id, {
      include: [Comment],
    });
    if (!product) return res.status(404).send("Product not found");
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
route.put("/:id", roleMiddleware(["admin", "seller", "super-admin"]), async (req, res) => {
  try {
    let { error } = ProductValadation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    if(req.user.role == "seller" && product.author_id != req.user.id){
      return res.status(400).send("Seller faqat ozining productini crud qiloladi")
    }
    await product.update(req.body);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
route.delete("/:id", roleMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    if(req.user.role == "seller" && product.author_id != req.user.id){
      return res.status(400).send("Seller faqat ozining productini crud qiloladi")
    }
    await product.destroy();
    res.status(200).send("Product deleted successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
