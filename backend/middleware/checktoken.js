const jwt = require('jsonwebtoken');
const SECRET_KEY = 'mysecretkey';


exports.checkToken = (req,res,next) => {
    const authHeader=req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({message:'Token is missing'});
    jwt.verify(token,SECRET_KEY,(err,user)=>{
        if (err) return res.status(401).json({message:'Invalid Token'});
        req.user=user;
        next();
    })
}
