const express=require('express')
const mongoose=require('mongoose')
const morgan=require('morgan')
const cors=require('cors')
const dotenv=require('dotenv')
const http=require('http')
const axios=require("axios")
const { connectDB } = require('./config/db')
const userRoutes=require("./routes/userRoutes")
const minesRoutes=require("./routes/minesRoutes")
//configuring dotenv 
dotenv.config()

//mongodb connection
connectDB()

const app=express()
const port=process.env.port
//middlewares

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true })); 
//routes
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/mines",minesRoutes)
//listen 

app.listen(port,()=>{
    console.log(`App is listening on port ${port}`);
})

