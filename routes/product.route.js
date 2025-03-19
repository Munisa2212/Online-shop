const { ProductValadation } = require('../models/product.module')
const { Product } = require('../models/index.module')
const express = require('express')
const productLogger = require('../logger')
const route = express.Router()
const { Op } = require('sequelize')
const { roleMiddleware } = require('../middleware/roleAuth')
const { Comment } = require('../models/index.module')
route.post('/', roleMiddleware(['admin', 'seller']), async (req, res) => {
  try {
    let { error } = ProductValadation.validate(req.body)
    if (error) {
      res.status(400).send(error.details[0].message)
      productLogger.log(
        'info',
        'Product create error',
        error.details[0].message,
      )
      return
    }
    let { name, description, count, price, image, author_id, category_id } =
      req.body

    let newProduct = await Product.create({
      name: name,
      description: description,
      count: count,
      price: price,
      image: image,
      author_id: author_id,
      category_id: category_id,
    })

    res.status(201).send(newProduct)
    productLogger.log('info', 'Product created successfully')
  } catch (error) {
    res.status(500).send(error.message)
    productLogger.log('error', 'Product da error!', error.message)
    return
  }
})

route.get('/', async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sort = 'id',
      order = 'ASC',
      name,
      category_id,
      min_price,
      max_price,
    } = req.query

    let where = {}

    if (name) where.name = { [Op.like]: `%${name}%` }

    if (category_id) where.category_id = category_id

    if (min_price && max_price) {
      where.price = { [Op.between]: [min_price, max_price] }
    } else if (min_price) {
      where.price = { [Op.gte]: min_price }
    } else if (max_price) {
      where.price = { [Op.lte]: max_price }
    }

    let products = await Product.findAndCountAll({
      where,
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [{ model: Comment, attributes: ['user_id', 'comment'] }],
    })

    res.status(200).send({
      products: products.rows,
    })
  } catch (error) {
    res.status(500).send(error.message)
    productLogger.log('info', 'Server error', error.message)
  }
})

route.get('/:id', async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id, {
      include: [Comment],
      attributes: ['id', 'user_id', 'comment'],
    })
    if (!product) return res.status(404).send('Product not found')
    res.status(200).send(product)
  } catch (error) {
    res.status(500).send(error.message)
    productLogger.log('info', 'server error', error.message)
    return
  }
})

route.put('/:id', roleMiddleware(['super-admin']), async (req, res) => {
  try {
    let { error } = ProductValadation.validate(req.body)
    if (error) {
      res.status(400).send(error.details[0].message)
      productLogger.log(
        'info',
        'Product update error',
        error.details[0].message,
      )
      return
    }

    let product = await Product.findByPk(req.params.id)
    if (!product) {
      res.status(404).send('Product not found')
      productLogger.log('info', 'Product not found')
      return
    }

    await product.update(req.body)
    productLogger.log('info', 'Product updated successfully')
    res.status(200).send(product)
  } catch (error) {
    res.status(500).send(error.message)
    productLogger.log('info', 'Product update error', error.message)
    return
  }
})

route.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id)
    if (!product) {
      res.status(404).send('Product not found')
      productLogger.log('info', 'Product not found')
      return
    }

    await product.destroy()
    res.status(200).send('Product deleted successfully')
    Product.log('info', 'Product deleted successfully')
  } catch (error) {
    res.status(500).send(error.message)
    Product.log('error', 'Product delete error', error.message)
    return
  }
})

module.exports = route
