import jwt from "jsonwebtoken";

const generateAccessToken = (payload:object) =>{
    return jwt.sign(payload,process.env.JWT_ACCESS_SECRET!,{
        expiresIn:"1d"
    })
}

const generateRefreshToken = (payload:object)=>{
    return jwt.sign(payload,process.env.JWT_REFRESH_SECRET!,{
        expiresIn:"7d"
    })
}

const verifyToken = (token:string,secret:string)=>{
    try {
        const decoded = jwt.verify(token,secret)
        return decoded
    } catch (error) {
        console.log("Error in verifyToken",error)
        return null
    }
}

export {generateAccessToken,generateRefreshToken,verifyToken}