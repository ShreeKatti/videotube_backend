import express from "express"
import cors from "cors" // cors is used to show what is required and what is not required

const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
})
)

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
export{ app }