const { Region } = require("../models/index.module");
const express = require("express");
const route = express.Router();
const { User } = require("../models/index.module");
const { Op } = require("sequelize");
const { regionLogger } = require("../logger");
const { roleMiddleware } = require("../middleware/roleAuth");

/**
 * @swagger
 * tags:
 *   name: Regions
 *   description: API endpoints for managing regions
 */

/**
 * @swagger
 * /region:
 *   get:
 *     summary: Get all regions
 *     description: Retrieve a list of all regions (Admin only)
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by region name
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved list of regions
 *       404:
 *         description: No regions found
 *       500:
 *         description: Internal server error
 */
route.get("/", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let { name } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `${name}%` };

    let regions = await Region.findAll({
      where,
      include: [{ model: User }],
    });
    if (regions.length === 0) {
      return res.status(404).send({ message: "No regions found" });
    }
    res.status(200).send(regions);
  } catch (error) {
    res.status(500).send(error.message);
    regionLogger.log("error", "/get error");
  }
});

/**
 * @swagger
 * /region:
 *   post:
 *     summary: Create a new region
 *     description: Adds a new region (Admin only)
 *     tags: [Regions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Region created successfully
 *       400:
 *         description: Region already exists or creation failed
 */
route.post("/", async (req, res) => {
  try {
    let existingRegion = await Region.findOne({ where: { name: req.body.name } });
    if (existingRegion) {
      return res.status(400).send({ message: "Region already exists" });
    }
    let region = await Region.create(req.body);
    res.status(201).send(region);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /region/{id}:
 *   get:
 *     summary: Get a specific region by ID
 *     description: Retrieve a region's details by its ID (Admin only)
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved region details
 *       404:
 *         description: Region not found
 */
route.get("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).send({ message: "Region not found" });
    res.status(200).send(region);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /region/{id}:
 *   put:
 *     summary: Update a region
 *     description: Modify an existing region's details (Admin only)
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Region updated successfully
 *       404:
 *         description: Region not found
 */
route.put("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).send({ message: "Region not found" });
    await region.update(req.body);
    res.status(200).send(region);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /region/{id}:
 *   delete:
 *     summary: Delete a region
 *     description: Remove an existing region (Admin only)
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Region deleted successfully
 *       404:
 *         description: Region not found
 */
route.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
  try {
    let region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).send({ message: "Region not found" });
    await region.destroy();
    res.status(200).send({ message: "Region deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = route;
