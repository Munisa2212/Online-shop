const {db} = require("../config/db")
const {dataTypes} = require("sequelize")
const joi = require("joi")

const Product  = db.define("Product",{
    id:{
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: dataTypes.STRING,
        allowNull: false
    },
    description:{
        type: dataTypes.STRING,
        allowNull: false
    },
    price:{
        type: dataTypes.FLOAT,
        allowNull: false
    },
    image:{
        type: dataTypes.STRING,
        allowNull: false
    },
    author_id:{
        type: dataTypes.INTEGER,
        allowNull: false
    },
    category_id:{
        type: dataTypes.INTEGER,
        allowNull: false
    }
})

const ProductValadation = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required(),
    image: joi.string(),
    author_id: joi.number().required(),
    category_id: joi.number().required()
})
module.exports = {Product, ProductValadation};