const jwt=require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY||"1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8";


const authenticateToken=(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({
            success: false,
            message: "Access denied. No token provided",
        });
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,SECRET_KEY,(err,user)=>{
        if (err) {
            return res.status(403).send({
                success: false,
                message: "Invalid token",
            });
        }

        req.user = user;
        next();
    })
    }
    catch(error){
        console.log("Error in authenticating token")
        return res.status(400).send({
            success: false,
            message: "Error in validating token",
        });
    }

}
module.exports=authenticateToken;