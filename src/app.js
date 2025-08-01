import express from "express"
import cors from "cors" // cors is used to show what is required and what is not required
import cookieParser from "cookie-parser"


const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
})
)

//import routes
import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js"

//routes

app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/users",userRouter)


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//app.use(errorHandler)

export{ app }