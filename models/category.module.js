const joi = require("joi")
const {db} = require("../config/db")
const { DataTypes } = require("sequelize")

const Category = db.define(
    "Categories",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
)

const CategoryValidation = joi.object({
    name: joi.number().required()
})

module.exports = {Category, CategoryValidation}