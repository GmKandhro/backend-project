import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  Jwt  from "jsonwebtoken";


export const varifyJwt = asyncHandler( async(req,res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authrization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401, "Not authorized");
        }
    
        const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401, "invalid access token");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message , 'Something went wrong');
    }

})
