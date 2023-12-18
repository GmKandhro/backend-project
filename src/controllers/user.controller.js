import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessTokenAndRefreshToken = async(userId)=>{
   try {
 let user =await User.findById(userId)
 
     const accessToken =  user.generateAccessToken()
     const refreshToken =  user.generateRefreshToken()
 
     user.refreshToken = refreshToken
     await user.save( {validateBeforeSave: false} )
     return {
         accessToken,
         refreshToken 
     }
   } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access token and refresh token")
   }
}

const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username, email,fullName,password} = req.body

    if (username == '' || fullName == '' || email == "" || password == "") {
        throw new ApiError('400','all fileds are required')
    }

   const existedUserWithEmail = await User.findOne({
    email
    })
   const existedUserWithUsername = await User.findOne({
    username
    })

    if(existedUserWithEmail){
        throw new ApiError(409,`user with ${email} email already exists`)
    }
    if(existedUserWithUsername){
        throw new ApiError(409,`user with ${username} username already exists`)
    }
   
     if(!Array.isArray(req.files.avatar)){
        throw new ApiError('400', "Avatar file is required")
    }

    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

   
    let avatar = await uploadOnCloudinary(req.files.avatar[0].path)
    let coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError('400', "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar?.url,
        coverImage: coverImage?.url || "",
        email,  
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(  "-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    

})

const loginUser = asyncHandler(async(req ,res)=>{
    // req body=> data
    // username or email
    // find the user
    // password check
    // access token and refresh token
    // send cookies
    // send response

    const {username, email,password} = req.body
    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

   let user = await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(!user){
        throw new ApiError(404, "username or email not found")
    }

    let isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "unValid password")
    }

    const { accessToken , refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure  : true,
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200 , {
        user: loggedInUser,
        accessToken,
        refreshToken
    },
    "user logged in successfully."))
})

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken: undefined}
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly: true,
        secure  : true,
    }

return res.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))


})

const refreshAccessToken = asyncHandler(async(req ,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
    throw new ApiError(400, "unauthrized required")
    }
   try {
     const deCodedRefreshToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(deCodedRefreshToken._id)
     if(!user){
         throw new ApiError(404, "invaild refresh Toke")
     }
 
 if (incomingRefreshToken !== user.refreshToken) {
     throw new ApiError(404, " refresh Toke is expires and used")
 }
 
 const options ={
     httpOnly: true,
     source :true
 }
 
 const {newRefreshToken , accessToken} = await generateAccessTokenAndRefreshToken(user._id)
 
 return res.status(200)
 .cookie("refreshToken", newRefreshToken, options)
 .cookie("accessToken", accessToken, options)
 .json(new ApiResponse(200, {accessToken , refreshToken : newRefreshToken}, "refresh token and access token updated"))
   } catch (error) {
    throw new ApiError(401 , error?.message || 'invaild refresh toke')
   }
    
    
})
export  {
    registerUser, loginUser ,logoutUser, refreshAccessToken
};