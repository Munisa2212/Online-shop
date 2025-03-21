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
const sendSMS = require("../config/eskiz")
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
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+998882452212"
 *               role:  
 *                 type: string
 *                 example: "admin"
 *               image: 
 *                 type: string
 *                 example: "profile.jpg"
 *               region_id:
 *                 type: number
 *                 example: 1
 *               year:
 *                 type: number
 *                 example: 1990
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
        console.log(otp);
        sendEmail(email, otp);
        sendSMS(phone, otp)
        res.send({message: "User created successfully otp is sended to email and phone"});
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
 *                 example: "johndoe@example.com"
 *               otp:
 *                 type: string
 *                 example: "12345"
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
 *                 example: "munisaforuse22@gmail.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       404:
 *         description: User not found.
 *       400:
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
        res.status(400).send({ message: "Internal server error" });
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
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
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

        let refresh_token = jwt.sign({ id: user.id, role: user.role }, "sekret",{expiresIn: "1d"});
        let access_token = jwt.sign({ id: user.id, role: user.role }, "sekret", { expiresIn: "15m" });
        res.send({ refresh_token: refresh_token, access_token: access_token });
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
 *       400:
 *         description: Internal server error.
 */

router.get("/", roleMiddleware(["admin"]), async (req, res) => {
    try {
        let users = await User.findAll({
            include: [{ model: Region, attributes: ["name"] }]
        });
        res.send(users);
    } catch (error) {
        res.status(400).send(error);
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
 *           example: 123
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
        res.status(400).send(error);
        userLogger.log("error", "/delete users error");
    }
});

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Foydalanuvchining shaxsiy ma'lumotlari va buyurtmalari
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari va buyurtmalari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           order_items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 count:
 *                                   type: integer
 *                                 product:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                     price:
 *                                       type: number
 *       404:
 *         description: Foydalanuvchi topilmadi
 *       400:
 *         description: Server xatosi
 */

router.get(
    "/me",
    roleMiddleware(["user", "admin", "super-admin", "seller"]),
    async (req, res) => {
      try {
        let { id } = req.user; 
        let user = await User.findOne({
          where: { id }, 
          include: [
            {
              model: Order,
              attributes: ["id"],
              include: [
                {
                  model: Order_item,
                  attributes: ["id", "count"],
                  include: [
                    {
                      model: Product, 
                      attributes: ["name", "price"],
                    },
                  ],
                },
              ],
            },
          ],
        });
  
        if (!user) {
          return res.status(404).json({ error: "User have not ordered get" });
        }
        res.json({ user });
      } catch (err) {
        console.log(err);
        res.status(400).json({ error: "Server error" });
      }
    }
  );

/**
 * @swagger
 * /user/refresh:
 *   get:
 *     summary: Foydalanuvchi tokenini yangilash
 *     description: Foydalanuvchi o‘zining eski tokeni orqali yangi access token oladi.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Yangi access token qaytariladi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Avtorizatsiya xatosi
 *       403:
 *         description: Ruxsat etilmagan
 */

router.get("/refresh",roleMiddleware(["user", "admin", "super-admin", "seller"]),async(req,res)=>{
  let id = req.user.id
  let role = req.user.role
  let access_token = jwt.sign({id: id,role: role},"sekret",{expiresIn: "15m"})
  res.send({access_token: access_token})
})

module.exports = router;
