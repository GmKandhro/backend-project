import {v2 as cloudinary } from 'cloudinary'
import  fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary  = async (localFilePath)=>{
    if(!localFilePath) return null
    try {
      //upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath , { resource_type:'auto' })
      // file has been uploaded successfull
      console.log("file is uploaded on cloudinary ", response.url);
      // console.log(response)
      fs.unlinkSync(localFilePath)
      return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
   
}

export {uploadOnCloudinary}