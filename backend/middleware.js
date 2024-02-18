const { JWT_secret } =require("./config") ;
const jwt=require("jsonwebtoken")

 function authMiddleware(req,res,next){
     const token=req.headers.authorization;

     if (!token || !token.startsWith("Bearer ")){
        res.status(403).json({
            message:"Error. please try again later."
        })
     }

     const jwttoken=token.split(" ")[1];
     try{
      const decode=jwt.verify(jwttoken,JWT_secret);
      if(decode.userid){
      req.userid=decode.userid;
      next();
      }
      else{
        return res.status(403).json({
            message:'You are not authorized.'
        })
      }
     }
     
     catch(e){
        res.status(403).json({
            message:e
        })
     }
}

module.exports={
    authMiddleware
}