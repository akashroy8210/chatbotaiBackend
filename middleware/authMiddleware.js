import jwt from "jsonwebtoken"

export const authMiddleware=async(req,res,next)=>{
    const authHeader=req.headers.authorization
    if(!authHeader){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }
    const token=authHeader.split(" ")[1]
    try{
        const decoded=await jwt.verify(token,process.env.SECRET)
        req.user={_id:decoded.id}
        next()
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"invalid token"
        })
    }
}