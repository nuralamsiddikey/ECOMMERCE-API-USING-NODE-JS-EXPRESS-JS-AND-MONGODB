const router = require('express').Router()
const CryptoJS = require('crypto-js')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const {
    verifyToken, 
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin
}  = require('./verifyToken')

//REGISTER
router.post('/register', async (req, res) => {
    try {

        let {
            userName,
            email,
            password,

        } = req.body

        const existUserName = await User.findOne({ userName })
        const existEmail = await User.findOne({ email })

        if (existUserName == null) {
            if (existEmail == null) {



                password = CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString()

                const user = {
                    userName,
                    email,
                    password
                }

                const newUser = new User(user)
                const result = await newUser.save()
                result && res.status(200).json({
                    message: "Successfully registered!",
                    error: false
                })





            }
            else {
                res.status(200).json({
                    message: "This email already exist",
                    error: true
                })
            }
        }
        else {
            res.status(200).json({
                message: "This user name already exist",
                error: true
            })
        }

    }
    catch (err) {
        res.status(500).json(err)
    }
})


// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const {
            userName,
            password
        } = req.body

        if (!userName) {
            res.status(401).json({ message: "Unauthorized" })
        } else {
            const user = await User.findOne({ userName })

            if (user != null) {
                const originalPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC).toString(CryptoJS.enc.Utf8)

                if (password == originalPassword) {

                    const accessToken = jwt.sign({
                        id: user._id,
                        isAdmin: user.isAdmin
                    }, process.env.JWT_SEC, { expiresIn: "5h"})



                    res.status(200).json({ 
                        message: "login successs" ,
                        token: accessToken
                    })
                }
                else {
                    res.status(401).json({ message: "Unauthorized" })
                }
            }
            else {
                res.status(401).json({ message: "Unauthorized" })
            }


        }


    }
    catch (err) {
        res.status(500).json(err)
    }
})


// UPDATE
router.put('/update/:id',verifyTokenAndAuthorization,async(req,res)=>{
        try{
             if(req.body.password){
                 req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
             }
             const updatedUser = await User.findByIdAndUpdate(
                 req.params.id,
                 {
                     $set: req.body
                 },
                 {new: true}
                 )
                 res.status(200).json(updatedUser)
        }
        catch(err){
            res.status(500).json(err)
        }
})



// DELETE USER
router.delete('/delete/:id',verifyTokenAndAuthorization,async(req,res)=>{
    try{
       const result = await  User.findByIdAndDelete(req.params.id)
    
         result && res.status(200).json("Successfully deleted")
    }
    catch(err){
        res.status(500).json(err)
    }
})


//FIND USER BY ID
router.get('/find/:id',verifyTokenAndAdmin,async(req,res)=>{
    try{
         const user = await User.findById(req.params.id,{password:0})
       
         user != null && res.status(200).json({
             message: "Showing results",
             result: user,
             error: false
         })
    }
    catch(err){
        res.status(500).json(err)
    }
})


//FIND ALL USER 
router.get('/',verifyTokenAndAdmin,async(req,res)=>{
   
    try{ 
        const query = req.query.new
         const user = query
             ? await User.find().sort({_id:-1}).limit(5)
             : await User.find()
 
         const len = user.length
         user.length && res.status(200).json({
             message: "Showing results",
             length: len,
             result: user,
             error: false
         })
    }
    catch(err){
        res.status(500).json(err)
    }
})



module.exports = router