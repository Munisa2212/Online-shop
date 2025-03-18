const {db} = require("../config/db")
const {DataTypes} = require("sequelize")
const joi = require("joi")

const Product  = db.define("Product",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    price:{
        type: DataTypes.FLOAT,
        allowNull: false
    },
    image:{
        type: DataTypes.STRING,
        allowNull: false
    },
    author_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    count:{
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
})

const ProductValadation = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required(),
    image: joi.string(),
    author_id: joi.number().required(),
    category_id: joi.number().required(),
    count: joi.number().required()
})
module.exports = {Product, ProductValadation};