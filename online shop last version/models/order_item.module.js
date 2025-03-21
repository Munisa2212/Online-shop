const joi = require("joi")
const {db} = require("../config/db")
const { DataTypes } = require("sequelize")

const Order_item = db.define(
    "Order_item",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
)

const Order_item_Validation = joi.object({
    products: joi.array().items(
        joi.object({
            product_id: joi.number().required(),
            count: joi.number().required()
        })
    ).required()
});

module.exports = {Order_item, Order_item_Validation}