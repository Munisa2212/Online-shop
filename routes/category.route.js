const router = require('express').Router();
const { CategoryValidation } = require('../models/category.module');
const { Op } = require('sequelize');
const { Product, Category } = require('../models/index.module');
const { roleMiddleware } = require('../middleware/roleAuth');
const { categoryLogger } = require('../logger');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of categories (admin/super-admin only).
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter categories by name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: ASC
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Internal server error
 */
router.get("/", roleMiddleware(["admin", "super-admin"]), async (req, res) => {
  try {
    let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };

    const categories = await Category.findAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      include: [{ model: Product }],
      attributes: ["id", "name"],
    });
    res.send(categories);
  } catch (error) {
    res.status(500).send(error.message);
    categoryLogger.log("error", "category get error", error.message);
  }
});

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req, res) => {
  try {
    let category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
      attributes: ["id", "name"],
    });
    if (!category) return res.status(404).send({ error: "Category not found" });
    res.send(category);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     description: Add a new category (admin only).
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post("/", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let { error } = CategoryValidation.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    let newCategory = await Category.create(req.body);
    categoryLogger.log("info", "category post created");
    res.status(201).send(newCategory);
  } catch (error) {
    res.status(500).send(error.message);
    categoryLogger.log("error", "category post error", error.message);
  }
});

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update category by ID
 *     description: Update an existing category (admin/super-admin only).
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Category Name"
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", roleMiddleware(["admin", "super-admin"]), async (req, res) => {
  try {
    let { error } = CategoryValidation.validate(req.body);
    if (error) {
      res.status(400).send({ error: error.details[0].message });
      categoryLogger.log("info", "category put error", error.message);
      return;
    }

    let category = await Category.findByPk(req.params.id);
    if (!category) {
      res.status(404).send({ error: "Category not found" });
      categoryLogger.log("info", "category not found");
      return;
    }

    await category.update(req.body);
    categoryLogger.log("info", "category updated successfully");
    res.send(category);
  } catch (error) {
    res.status(500).send(error.message);
    categoryLogger.log("error", "category update error", error.message);
  }
});

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     description: Remove a category (admin only).
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).send({ error: "Category not found" });

    await category.destroy();
    res.send({ message: "Category deleted successfully" });
    categoryLogger.log("error", "deleted category successfully");
  } catch (error) {
    res.status(500).send(error.message);
    categoryLogger.log("error", "category delete error", error.message);
  }
});

module.exports = router;

