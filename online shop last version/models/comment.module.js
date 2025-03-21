const { db } = require('../config/db')
const { DataTypes } = require('sequelize')
const joi = require('joi')

const Comment = db.define("Comment",{
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
  star: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
})

const CommentValidation = joi.object({
  product_id: joi.number().required(),
  comment: joi.string().required(),
  star: joi.number().max(5).min(0).required()
})

module.exports = { Comment, CommentValidation }
