const express = require('express')
const app     = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
var cors = require('cors')
dotenv.config()
app.use(cors())


app.use(express.json())
app.use(express.static('./images'))

 
// IMPORT CONTROLLERS
const userRouter = require('./controllers/users')
const productRouter = require('./controllers/product')
// const cartRouter    = require('./controllers/cart')
 const orderRouter   = require('./controllers/order')

app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
// app.use('/api/cart',cartRouter)
 app.use('/api/order',orderRouter)


 
// ERROR HANDLER
const errorHandlerRouter = require('./controllers/errorHandler')
app.use(errorHandlerRouter)

 

//DATABASE CONNECTION
mongoose.connect(process.env.DB)
.then(()=>console.log("Database connection successfull"))
.catch(err=>console.log(err))

//LISTENING SERVER
app.listen(5000,()=>{
    console.log("Backend server is listeing...")
})