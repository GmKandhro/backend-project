import { Express } from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = Express()

app.use(cors({
    origin:process.env.COR_ORIGIN,
    credentials:true,
}))

app.use(express.urlencoded({extended : true, limit:'16kb'}))
app.use(express.static('public'))
app.use(express.json({limit : '16kb'}))
app.use(cookieParser())

export {app}