const { Comment } = require("../models/comment.module")

const app = require("express").Router()

app.post("/", async(req, res)=>{
    const {user_id, product_id, comment} = req.body
    try {
        const data = await Comment.create({user_id, product_id, comment})
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})



module.exports = app