const {ProductValadation} = require("../models/product.module")
const {Product} = require("../models/index.module")
const express = require("express")
const route = express.Router()

route.post("/", async(req, res)=>{
    try {
        let {error} = ProductValadation.validate(req.body)
        if(error) return res.status(400).send(error.details[0].message)
        let newProduct = await Product.create(req.body)
        res.send(newProduct)
    } catch (error) {
        res.status(404).send(error)
    }
})