const jwt = require("jsonwebtoken")

const auth_middleware = (req, res, next)=>{
    let token = req.header("Authorization")?.split(" ")[1]
    
    if(!token){
        return res.send("Token is not provided")
    }
    try {
        const data = jwt.verify(token, "secretword")
        req.user = data
        next()
    } catch (error) {
        res.send(error)
    }
}

module.exports = auth_middleware