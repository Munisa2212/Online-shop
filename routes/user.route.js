const router = require("express").Router();
const { User, UserValidation, LoginValidation } = require("../models/user.module");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { totp } = require("otplib");
const { sendEmail } = require("../config/transporter");
const { roleMiddleware } = require("../middleware/roleAuth");
const { Region } = require("../models/index.module");
const { Op } = require("sequelize");
const { userLogger } = require("../logger");

totp.options = { step: 300, digits: 5 };

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user and sends an OTP for verification.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                  example: Munisa
 *               password:
 *                 type: string
 *                  example: hello22
 *               email:
 *                 type: string
 *                  example: munisaforuse22@gmail.com
 *               phone:
 *                 type: string
 *                  example: +998882452212
 *               role:  
 *                 type: string
 *                  example: admin
 *               image: 
 *                 type: string
 *                  example: photo
 *               region_id:
 *                 type: number
 *                  example: 1
 *               year:
 *                 type: number
 *                  example: 2005
 *     responses:
 *       200:
 *         description: Registration successful, OTP sent.
 *       400:
 *         description: Validation error or user already exists.
 *       404:
 *         description: Not found error.
 */
router.post("/register", async (req, res) => {
    try {
        let { error } = UserValidation.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { username, password, email, phone, ...rest } = req.body;
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            return res.status(400).send({ message: "User already exists, email exists" });
        }
        let hash = bcrypt.hashSync(password, 10);
        let newUser = await User.create({
            ...rest,
            username: username,
            phone: phone,
            email: email,
            password: hash
        });
        let otp = totp.generate(email + "email");
        sendEmail(email, otp);
        res.send(`/verify email\nToken sent to ${email}`);
        userLogger.log("info", `/register with ${newUser.id} id`);
    } catch (error) {
        res.status(404).send(error);
        userLogger.log("error", "/register error");
    }
});

/**
 * @swagger
 * /user/verify:
 *   post:
 *     summary: Verify user email
 *     description: Verifies user email using OTP.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                  example: munisaforuse22@gmail.com
 *               otp:
 *                 type: string
 *                  example: 11111
 *     responses:
 *       200:
 *         description: Email successfully verified.
 *       404:
 *         description: User not found or invalid OTP.
 */
router.post("/verify", async (req, res) => {
    let { email, otp } = req.body;
    try {
        let user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send({ message: "User not found" });

        let match = totp.verify({ token: otp, secret: email + "email" });
        if (!match) return res.status(404).send({ message: "Otp is not valid" });

        await user.update({ status: "ACTIVE" });
        res.send({ message: "Email successfully verified! You can now log in." });
        userLogger.log("info", `/verify with ${user.email}`);
    } catch (error) {
        res.send(error);
        userLogger.log("error", "/verify error");
    }
});

/**
 * @swagger
 * /user/resend-otp:
 *   post:
 *     summary: Resend OTP to user email
 *     description: Sends a new OTP to the user's registered email.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: munisaforuse22@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/resend-otp", async (req, res) => {
    let { email } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        console.log(email);
        const token = totp.generate(email + "email");
        console.log("OTP: ", token);
        sendEmail(email, token);
        res.send({ message: `Token sent to ${email}` });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     description: Logs in a user and returns a JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                  example: munisaforuse22@gmail.com
 *               password:
 *                 type: string
 *                  example: hello22
 *     responses:
 *       200:
 *         description: Login successful.
 *       400:
 *         description: Wrong password or email not verified.
 *       404:
 *         description: User not found.
 */
router.post("/login", async (req, res) => {
    try {
        let { error } = LoginValidation.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let { password, email } = req.body;
        let user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send({ message: "User not found" });

        let match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).send({ message: "Wrong password" });

        if (user.status != "ACTIVE") return res.status(400).send({ message: "Verify your email first!" });

        let token = jwt.sign({ id: user.id, role: user.role }, "sekret");
        res.send({ Your_Token: token });
        userLogger.log("info", `/login with ${user.id} id`);
    } catch (err) {
        res.status(400).send(err);
        userLogger.log("error", "/login error");
    }
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users. Admin access only.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users.
 *       500:
 *         description: Internal server error.
 */
router.get("/", roleMiddleware(["admin"]), async (req, res) => {
    try {
        let users = await User.findAll({
            include: [{ model: Region, attributes: ["name"] }]
        });
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
        userLogger.log("error", "/get users error");
    }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user. Admin access only.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */
router.delete("/:id", roleMiddleware(["admin"]), async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });

        await user.destroy();
        res.send({ message: "User deleted successfully" });
        userLogger.log("info", `/delete/:id user with ${user.id}`);
    } catch (error) {
        res.status(500).send(error);
        userLogger.log("error", "/delete users error");
    }
});

module.exports = router;

