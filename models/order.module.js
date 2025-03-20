const joi = require("joi")
const {db} = require("../config/db")
const { DataTypes } = require("sequelize")

const Order = db.define(
    "Orders",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
)

const OrderValidation = joi.object({
    user_id: joi.number().required()
})

module.exports = {Order, OrderValidation}