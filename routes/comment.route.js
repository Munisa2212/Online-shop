const { CommentValidation } = require("../models/comment.module");
const { Comment } = require("../models/index.module")
const app = require("express").Router()
const { roleMiddleware } = require("../middleware/roleAuth")

app.post("/",roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const {user_id, product_id, comment} = req.body
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const data = await Comment.create({user_id, product_id, comment})
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})

app.get("/", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    try {
        const data = await Comment.findAll()
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.put("/:id", roleMiddleware(["super-admin"]), async(req, res)=>{
    const {id} = req.params
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        const data = await Comment.findByPk(id)
        await data.update(req.body)
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.delete("/:id", roleMiddleware(["admin", "seller"]), async(req, res)=>{
    const {id} = req.params
    try {
        const data = await Comment.findByPk(id)
        await data.destroy()
        res.send(data)
    } catch (error) {
        res.status(500).send(error)
    }
})
module.exports = app
