const { db } = require('../config/db')
const { DataTypes } = require('sequelize')
const joi = require('joi')

const user = db.define('user', {
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
        allowNull: false,
        defaultValue: 'user',
    },
    region_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
    },
    year:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})

const UserValidation = joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().required(),
    image: joi.string(),
    role: joi.string(),
    region_id: joi.number().required(),
    status: joi.string(),
    year: joi.number().required()
})

module.exports = { user, UserValidation }