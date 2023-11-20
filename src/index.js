import  dotenv  from "dotenv";
import {connectDB} from "./db/index.js";
import {app} from './app.js'

const port = process.env.PORT || 8000;

dotenv.config({
    path:'./env'
})

connectDB().then(()=>{
    app.listen(port,()=>{
        console.log('Server is listening on PORT :' , port)
    })
}).catch((err)=>{
    console.log('mongooDB connection failed Error : ', err)
})