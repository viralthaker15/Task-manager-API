const express = require('express')
const Task = require('../models/task')
const auth = require("../middleware/auth")

const router = new express.Router()

router.post("/tasks" , auth , async (req,res) => {
   
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    
    try{
       await task.save()
       res.status(201).send(task)
   }catch(e){
       res.send(400).send()
   }
})


//GET /tasks?completed=true 
router.get("/tasks" , auth , async (req,res) => {
    //const tasks = await Task.find({ owner : req.user._id })
    const match = {}
    const sort = {}
    
    if (req.query.completed)
            match.completed = req.query.completed==='true'

    if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')   
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
   
    try {

       await req.user.populate({ 
          path : 'tasks' ,
          match ,
          options : {
              limit : parseInt(req.query.limit) , //sets the limit for fetching data (pagination)
              skip : parseInt(req.query.skip) ,
              sort
            }
        }).execPopulate()
        
       res.send(req.user.tasks)
   }catch(e){
       res.status(500).send()  
   }
})

router.get("/tasks/:id", auth , async (req,res) => {
   try{
       const task = await Task.findOne({_id : req.params.id , owner : req.user._id})
       if(!task)
           return res.status(404).send()
       res.send(task)
   }catch(e){
       res.status(500).send()
   }

})

router.patch("/tasks/:id" , auth , async (req,res) => {
   //to check if the user provided valid json body for updation 
   const updates = Object.keys(req.body)
   const allowedUpdates = ['description']
   const isvalidOperation = updates.every((update) => allowedUpdates.includes(update))

   if(!isvalidOperation)
       return res.status(400).send({ error : 'invalid updates'})
       
   try{
    //const task = await Task.findByIdAndUpdate(req.params.id , req.body , { new : true , runValidators: true})

    const task = await Task.findOne({_id : req.params.id , owner : req.user._id}) ////instead of using findByIdandUpdate because it bypasses the middleware
                                                            
       if(!task)
            return res.status(404).send()

    updates.forEach((update) => task[update] = req.body[update]) //we dont know which field is updating so here we dynamically updating fields
    await task.save()        
       res.send(task)
   }catch(e){
       res.status(400).send(e)
   }
})

router.delete("/tasks/:id" , auth , async (req,res) => {
   try{
       //const task = await Task.findByIdAndDelete(req.params.id) 

       const task = await Task.findOneAndDelete({_id : req.params.id , owner : req.user._id})
       
       if(!task)
           return res.status(404).send()

       res.send(task)   
   }catch(e){
       res.status(500).send()
   }
})

module.exports = router
