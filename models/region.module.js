const joi = require("joi")
const {db} = require("../config/db")
const { DataTypes } = require("sequelize")

const Region = db.define(
    "Regions",
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

const RegionValidation = joi.object({
    name: joi.string().required()
})

module.exports = {Region, RegionValidation}