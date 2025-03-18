const { Region } = require('../models/index.module')
const express = require('express')
const route = express.Router()

route.get('/', async (req, res) => {
  try {
    let regions = await Region.findAll()
    if (regions.length === 0) {
      return res.status(404).send({ message: 'No regions found' })
    }
    res.status(200).send(regions)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

route.post('/', async (req, res) => {
  try {
    let one = await oneRegion.findOne({
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
  } catch (error) {
    res.status(400).send(error.message)
  }
})

route.get('/:id', async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id)
    if (!region) {
      return res.status(404).send({ message: 'Region not found' })
    }
    res.status(200).send(region)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

route.put('/:id', async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id)
    if (!region) {
      return res.status(404).send({ message: 'Region not found' })
    }
    await region.update(req.body)
    res.status(200).send(region)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

route.delete('/:id', async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id)
    if (!region) {
      return res.status(404).send({ message: 'Region not found' })
    }
    await region.destroy()
    res.status(200).send({ message: 'Region deleted successfully' })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = route
