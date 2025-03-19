const router = require('express').Router()
const { CategoryValidation } = require('../models/category.module')
const { Op } = require('sequelize')
const { Product, Category } = require('../models/index.module')
const { roleMiddleware } = require('../middleware/roleAuth')
const { categoryLogger } = require('../logger')

router.get("/", roleMiddleware(["admin", "super-admin"]),async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC"} = req.query;
        const where = {};
        if (name) where.name = { [Op.like]: `%${name}%` };

    const categories = await Category.findAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      include: [{ model: Product }],
      attributes: ['id', 'name'],
    })
    res.send(categories)
  } catch (error) {
    res.status(500).send(error.message)
    categoryLogger.log('error', 'category get error', error.message)
  }
})

router.get("/:id", async (req, res) => {
    try {
        let category = await Category.findByPk(req.params.id,{
            include: [{ model: Product }],
            attributes: ["id", "name"]
    });
        if (!category) return res.status(404).send({ error: "Category not found" });
        res.send(category);
    } catch (error) {
        res.status(500).send(error.message)
    }
});

router.post('/', roleMiddleware(['admin']), async (req, res) => {
  try {
    let { error } = CategoryValidation.validate(req.body)
    if (error) return res.status(400).send({ error: error.details[0].message })

    let newCategory = await Category.create(req.body)
    categoryLogger.log('info', 'category post created')
    res.status(201).send(newCategory)
  } catch (error) {
    res.status(500).send(error.message)
    categoryLogger.log('error', 'category post error', error.message)
  }
})

router.put(
  '/:id',
  roleMiddleware(['admin', 'super-admin']),
  async (req, res) => {
    try {
      let { error } = CategoryValidation.validate(req.body)
      if (error) {
        res.status(400).send({ error: error.details[0].message })
        categoryLogger.log('info', 'category put error', error.message)
        return
      }

      let category = await Category.findByPk(req.params.id)
      if (!category) {
        res.status(404).send({ error: 'Category not found' })
        categoryLogger.log('info', 'category not found')
        return
      }

      await category.update(req.body)
      categoryLogger.log('info', 'category updated successfully')
      res.send(category)
    } catch (error) {
      res.status(500).send(error.message)
      categoryLogger.log('error', 'category update error', error.message)
    }
  },
)

router.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    let category = await Category.findByPk(req.params.id)
    if (!category) return res.status(404).send({ error: 'Category not found' })

    await category.destroy()
    res.send({ message: 'Category deleted successfully' })
    categoryLogger.log('error', 'deleted category successfully')
  } catch (error) {
    res.status(500).send(error.message)
    categoryLogger.log('error', 'category delete error', error.message)
  }
})

module.exports = router
