const { Region } = require('../models/index.module')
const express = require('express')
const route = express.Router()
const {User} = require("../models/index.module")
const {Op} = require("sequelize")
const {regionLogger} = require("../logger")
const {roleMiddleware} = require("../middleware/roleAuth")

route.get('/', roleMiddleware(["admin"]),async (req, res) => {
  try {
    let {name} = req.query
    const where = {}
    if (name) where.name = { [Op.like]: `${name}%`}
    
    let regions = await Region.findAll({
      where,
      include: [{model: User}]
    })
    if (regions.length === 0) {
      return res.status(404).send({ message: 'No regions found' })
    }
    res.status(200).send(regions)
  } catch (error) {
    res.status(500).send(error.message)
    regionLogger.log("error", "/get error")
  }
})

route.post('/', roleMiddleware(["admin"]),async (req, res) => {
  try {
    let one = await Region.findOne({
      where: {
        name: req.body.name,
      },
    })
    if (one) {
      return res.status(400).send({ message: 'Region already exists' })
    }
    let region = await Region.create(req.body)
    if (!region) {
      return res.status(400).send({ message: 'Region creation failed' })
    }
    res.status(201).send(region)
    regionLogger.log("info", "/post")
  } catch (error) {
    res.status(400).send(error.message)
    regionLogger.log("error", "/post error")
  }
})

route.get('/:id', roleMiddleware(["admin"]),async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id)
    if (!region) {
      return res.status(404).send({ message: 'Region not found' })
    }
    res.status(200).send(region)
    regionLogger.log("info", `/get/:id region with ${region.id}`)
  } catch (error) {
    res.status(500).send(error.message)
    regionLogger.log("error", `/get/:id region error`)
  }
})

route.put('/:id', roleMiddleware(["admin"]),async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id)
    if (!region) {
      return res.status(404).send({ message: 'Region not found' })
    }
    await region.update(req.body)
    res.status(200).send(region)
    regionLogger.log("info", `/put/:id region with ${region.id}`)
  } catch (error) {
    res.status(500).send(error.message)
    regionLogger.log("error", `/put/:id region error`)
  }
})

route.delete('/:id', roleMiddleware(["admin"]),async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id)
    if (!region) {
      return res.status(404).send({ message: 'Region not found' })
    }
    await region.destroy()
    res.status(200).send({ message: 'Region deleted successfully' })
    regionLogger.log("info", `/delete/:id region with ${region.id}`)
  } catch (error) {
    res.status(500).send(error.message)
    regionLogger.log("error", `/delete/:id region error`)
  }
})

module.exports = route
