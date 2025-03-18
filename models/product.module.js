const {db} = require("../config/db")
const {dataTypes} = require("sequelize")

const product  = db.define("Product",{
    id:{
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: dataTypes.STRING,
        allowNull: false
    },
    description:{
        type: dataTypes.STRING,
        allowNull: false
    },
    price:{
        type: dataTypes.FLOAT,
        allowNull: false
    },
    image:{
        type: dataTypes.STRING,
        allowNull: false
    },
    author_id:{
        type: dataTypes.INTEGER,
        allowNull: false
    },
    category_id:{
        type: dataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = product;