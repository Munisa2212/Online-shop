const router = require("express").Router()
const {User, UserValidation, LoginValidation} = require("../models/user.module")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {totp} = require("otplib")
const { sendEmail } = require("../config/transporter")
const sendSMS = require("../config/eskiz")
const {roleMiddleware} = require("../middleware/roleAuth")

totp.options = {step: 300, digits: 5}
router.post("/register", async(req, res)=>{
    try {
        let {error} = UserValidation.validate(req.body)
        if(error) {
            return res.status(400).send(error.details[0].message)
        }
        const {username, password, email, phone, ...rest} = req.body
        let user = await User.findOne({where: {email: email}})
        if(user){
            console.log(user);
            return res.status(400).send({message: "User already exists, email exists"})
        }
        let hash = bcrypt.hashSync(password, 10)
        let newUser = await User.create({
            ...rest,
            username: username,
            phone: phone,
            email: email,
            password: hash
        })
        let otp = totp.generate(email + "email")
        console.log(otp);
        
        sendEmail(email, otp)
        await sendSMS(phone, otp)
        res.send(`/verify email\nToken sent to ${email}`)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.post("/verify", async (req, res) => {
    let { email, otp } = req.body;
    try {
      let user = await User.findOne({ where: { email: email } });
      if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      let match = totp.verify({ token: otp, secret: email + "email" });
      if (!match) {
        res.status(404).send({ message: "Otp is not valid" });
        return;
      }
      await user.update({ status: "ACTIVE" });
      res.send({message: "Email muvoffaqiyatli tasdiqlandi! Endi /login qilish mumkin!"});
    } catch (error) {
      console.log(error);
      res.send(error);
    }
});

router.post("/login", async(req, res)=>{
    try{
        let {error} = LoginValidation.validate(req.body)
        if(error) {
            return res.status(400).send(error.details[0].message)
        }
        let {password, email, username} = req.body
        let user = await User.findOne({where: {email: email, username: username}})
        if(!user){
            return res.status(404).send({message: "User not found"})
        }
        let match = bcrypt.compareSync(password, user.password)
        if(!match){
            return res.status(400).send({message: "Wrong password"})
        }
        if(user.status != "ACTIVE"){
            return res.status(400).send({message: "Birinchi email ni verfy qiling!"})
        }
        let token = jwt.sign({id: user.id, role: user.role}, "sekret")
        res.send({Your_Token: token})
    }catch(err){
        res.status(400).send(err)
    }
})

router.post("/resend-otp", async (req, res) => {
    let { email } = req.body;
    try {
        let user = await User.findOne({where: {email}})
        if(!user){
            return res.status(404).send("User not foun")
        }
        console.log(email);
        const token = totp.generate(email + "email");
        console.log("OTP: ", token);
        sendEmail(email, token);
      res.send({ message: `Token ${email} emailga yuborildi` });
    } catch (error) {
      console.log(error);
    }
});

router.get("/", roleMiddleware(["admin"]),async (req, res) => {
    try {
        let users = await User.findAll();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/:id", roleMiddleware(["admin"]),async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put("/:id", roleMiddleware(["admin"]),async (req, res) => {
    try {
        let { error } = UserValidation.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        let user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        await user.update(req.body);
        res.send({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete("/:id", roleMiddleware(["admin"]),async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        await user.destroy();
        res.send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router
