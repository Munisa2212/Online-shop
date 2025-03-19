const { Op } = require("sequelize");
const { roleMiddleware } = require("../middleware/roleAuth");
const { CommentValidation } = require("../models/comment.module");
const { Comment, User, Product } = require("../models/index.module")
const app = require("express").Router()
const {commentLogger} = require("../logger")

app.post("/",roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const {user_id, product_id, comment} = req.body
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const data = await Comment.create({user_id, product_id, comment})
        commentLogger.log("info", "comment created successfully")
        res.send(data)
    } catch (error) {
        res.send(error)
        commentLogger.log("error", "comment post error")
    }
})

app.get("/", roleMiddleware(["admin", "seller"]), async (req, res) => {
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
            include: [{ model: User, attributes: ["username", "email"]}, { model: Product, attributes: ["name", "description", "price"]}]
        });

        res.send(rows);
    } catch (error) {
        categoryLogger.log("error", error);
        res.status(500).json({ error: error.message });
        commentLogger.log("error", "comment get error")
    }
});

app.get("/:id", async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Comment.findByPk(id)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
        commentLogger.log("error", "comment get by id error")
    }
})
app.put("/:id", roleMiddleware(["super-admin"]), async(req, res)=>{
    const {id} = req.params
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const data = await Comment.findByPk(id)
        await data.update(req.body)
        commentLogger.log("info", `comment with ${id} id updated successfully`)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
        commentLogger.log("error", "comment update error")
    }
})

app.delete("/:id", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Comment.findByPk(id)
        await data.destroy()
        commentLogger.log("info", `comment with ${id} id deleted successfully`)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
        commentLogger.log("error", "comment delete error")
    }
})
module.exports = app
