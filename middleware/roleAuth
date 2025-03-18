  const jwt = require("jsonwebtoken")

function roleMiddleware(roles){
    return (req, res, next)=>{
        try{
            let token = req.header("Authorization")?.split(" ")[1]
            if(!token){
                return res.status(401).send({message: "Token not provided"})
            }
            let data = jwt.verify(token, 'sekret')
            if(roles.includes(data.role)){
                console.log(roles, data.role);
                return next()
            }
            return res.status(400).send(`Not allowed for ${data.role}, only for ${roles}`)
        }catch(err){
            return res.status(401).send(err)
        }
    }
}

module.exports = {roleMiddleware}
