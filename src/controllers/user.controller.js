import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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
     const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError('400', "Avatar file is required")
    }
    let avatar = await uploadOnCloudinary(avatarLocalPath)
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

export default registerUser;