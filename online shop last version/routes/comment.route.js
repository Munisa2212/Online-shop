const { Op } = require("sequelize");
const { roleMiddleware } = require("../middleware/roleAuth");
const { CommentValidation } = require("../models/comment.module");
const { Comment, User, Product } = require("../models/index.module");
const app = require("express").Router();
const { commentLogger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management
 */

/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Create a new comment
 *     description: Add a new comment (admin, user, super-admin, seller).
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               product_id:
 *                 type: integer
 *                 example: 2
 *               comment:
 *                 type: string
 *                 example: "This product is amazing!"
 *     responses:
 *       200:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
app.post("/", roleMiddleware(["admin", "user", "super-admin", "seller"]), async (req, res) => {
    const { user_id, product_id, comment } = req.body;
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const data = await Comment.create({ user_id, product_id, comment });
        commentLogger.log("info", "comment created successfully");
        res.send(data);
    } catch (error) {
        res.send(error);
        commentLogger.log("error", "comment post error");
    }
});

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of comments.
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: comment_id
 *         schema:
 *           type: integer
 *         description: Filter by comment ID
 *       - in: query
 *         name: comment
 *         schema:
 *           type: string
 *         description: Filter by comment text
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of comments
 *       500:
 *         description: Internal server error
 */
app.get("/", roleMiddleware(["admin", "user", "super-admin", "seller"]), async (req, res) => {
    try {
        let { user_id, comment_id, comment, page = 1, limit = 10 } = req.query;
        const one = {};
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        if (user_id) one.user_id = { [Op.like]: `%${user_id}%` };
        if (comment_id) one.comment_id = { [Op.like]: `%${comment_id}%` };
        if (comment) one.comment = { [Op.like]: `%${comment}%` };

        const { rows } = await Comment.findAndCountAll({
            where: one,
            limit: limit,
            offset: offset,
            include: [
                { model: User, attributes: ["username", "email"] },
                { model: Product, attributes: ["name", "description", "price"] }
            ]
        });

        res.send(rows);
    } catch (error) {
        commentLogger.log("error", "comment get error");
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a comment using its ID.
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
app.get("/:id", roleMiddleware(["admin", "user", "super-admin", "seller"]), async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Comment.findByPk(id);
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
        commentLogger.log("error", "comment get by id error");
    }
});

/**
 * @swagger
 * /comment/{id}:
 *   patch:
 *     summary: Update a comment
 *     description: Modify an existing comment (super-admin only).
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
app.patch("/:id", roleMiddleware(["super-admin"]), async (req, res) => {
    const { id } = req.params;
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const data = await Comment.findByPk(id);
        await data.update(req.body);
        commentLogger.log("info", `comment with ${id} id updated successfully`);
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
        commentLogger.log("error", "comment update error");
    }
});

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Remove a comment (admin or seller only).
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
app.delete("/:id", roleMiddleware(["admin", "seller"]), async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Comment.findByPk(id);
        await data.destroy();
        commentLogger.log("info", `comment with ${id} id deleted successfully`);
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
        commentLogger.log("error", "comment delete error");
    }
});

module.exports = app;
