const { db } = require('../config/db')
const { DataTypes } = require('sequelize')
const joi = require('joi')

const User = db.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
},
email: {
    type: DataTypes.STRING,
    allowNull: false,
},
password: {
    type: DataTypes.STRING,
    allowNull: false,
},
phone:{
    type: DataTypes.STRING,
    allowNull: false,
},
image:{
    type: DataTypes.STRING,
    allowNull: true,
},
role:{
    type: DataTypes.STRING,
    defaultValue: 'user',
},
region_id:{
    type: DataTypes.INTEGER,
    allowNull: false,
},
status:{
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
},
year:{
    type: DataTypes.INTEGER,
    allowNull: false,
}
},
{timestamps: false})

const UserValidation = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().required(),
    image: joi.string(),
    role: joi.string().valid("admin", "user", "super-admin", "seller"),
    region_id: joi.number().required(),
    status: joi.string(),
    year: joi.number().min(0).max(2026).required()
})

const LoginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})

module.exports = { User, UserValidation, LoginValidation}
