const { db } = require('../config/db')
const { DataTypes } = require('sequelize')
const joi = require('joi')

const Category = db.define({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

const CategoryValidation = joi.object({
  name: joi.string().required()
})

module.exports = { Category, CategoryValidation }
