const { db } = require('../config/db')
const { DataTypes } = require('sequelize')
const joi = require('joi')

const Comment = db.define({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

const CommentValidation = joi.object({
  user_id: joi.number().required(),
  product_id: joi.number().required(),
  comment: joi.string().required(),
})

module.exports = { Comment, CommentValidation }
