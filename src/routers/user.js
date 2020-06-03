const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const email = require('../emails/account')
const multer = require('multer')
const router = new express.Router()
const sharp = require('sharp')

const upload = multer({
    limits : {
        fileSize : 1000000
    } ,
    fileFilter (req , file , cb) {
        // cb(new Error('File must be a PDF')) //to send error to client
        // cb(undefined , true) // first argument is for error so its undefined when upload is required and true is for that upload was accepted
        // cb(undefined , false) // here second argument when even the upload was required the upload is silently rejected without notifying user
        // //third approach is merely used mostly first and second is used only

        if(!file.originalname.match(/\.(jpg|jpeg|png|PNG)$/))
            return cb(new Error('Please upload a valid format picture'))

        cb(undefined , true)
    }
})

router.post("/users" , async (req,res) => {
    const user = new User(req.body) 
    try
    {
        email.sendWelcomeEmail(user.email , user.Name)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({ user , token })
    } catch(e){
        res.status(400).send(e)
    }
})

router.post("/users/login" ,  async(req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()    
        res.send({ user , token })
    } catch(e) {
        res.status(400).send(e)
    } 
})

router.post("/users/logout", auth , async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
            //when it returns true it will iterate over and do nothing
            //when it returns false it will remove the token and iterate to next   
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/logoutAll", auth , async(req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/me/avatar" , auth , upload.single('avatar') ,async (req , res) => {
    
    const buffer = await sharp(req.file.buffer).resize({ width : 250 , height : 250 }).png().toBuffer()
    
    req.user.avatar= buffer
    await req.user.save() 
    res.send()
} , (error , req , res , next) => {
        res.status(400).send({ error : error.message })
})

router.get('/users/me' , auth , async (req,res) => {
    res.send(req.user)
})

router.patch("/users/me" , auth , async (req,res) => {
    //to check if the user provided valid json body for updation
    const updates = Object.keys(req.body)
    const allowedUpdates = ['Name' , 'email' , 'password']
    const isvalidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isvalidOperation)
        return res.status(400).send({ error : 'invalid updates'})

    try{
        //const user = await User.findByIdAndUpdate(req.params.id , req.body , { new : true , runValidators: true})

        updates.forEach((update) => req.user[update] = req.body[update]) //we dont know which field is updating so here we dynamically updating fields
        await req.user.save()                                                            //instead of using findByIdandUpdate because it bypasses the middleware
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/users/me" , auth , async (req,res) => {
    try{
        email.sendExitEmail(req.user.email , req.user.Name)
        await req.user.remove()
        res.send(req.user)   
    }catch(e){
        res.status(500).send()  
    }
})

router.delete("/users/me/avatar" , auth , async (req , res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar' ,  async (req , res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar)
                throw new Error()

        res.set('Content-Type' , 'image/PNG') // to manipulate response header we use set method
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router
