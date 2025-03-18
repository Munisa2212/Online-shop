const router = require("express").Router();
const { Category, CategoryValidation } = require("../models/category.module");
const { Op } = require("sequelize");
const { roleMiddleware } = require("../middleware/roleAuth");

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
        });
        res.send(categories);
    } catch (error) {
        res.status(400).send(error.message)
    }
});

router.get("/:id", async (req, res) => {
    try {
        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).send({ error: "Category not found" });
        res.send(category);
    } catch (error) {
        res.status(400).send(error.message)
    }
});

router.post("/", roleMiddleware(["admin"]), async (req, res) => {
    try {
        let { error } = CategoryValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        let newCategory = await Category.create(req.body);
        res.status(201).send(newCategory);
    } catch (error) {
        res.status(400).send(error.message)
    }
});

router.put("/:id", roleMiddleware(["admin", "super-admin"]), async (req, res) => {
    try {
        let { error } = CategoryValidation.validate(req.body);
        if (error) return res.status(400).send({ error: error.details[0].message });

        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).send({ error: "Category not found" });

        await category.update(req.body);
        res.send(category);
    } catch (error) {
        res.status(400).send(error.message)
    }
});

router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
    try {
        let category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).send({ error: "Category not found" });

        await category.destroy();
        res.send({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).send(error.message)
    }
});

module.exports = router;
