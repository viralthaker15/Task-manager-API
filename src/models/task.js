const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
     description :{ 
          type : String,
          Completed : Boolean,
          required: true,
          trim: true
         },
         completed : {
              type : Boolean,
              default : false
         } ,
         owner : {
              type : mongoose.Schema.Types.ObjectId ,
              required : true ,
              ref : "User" //we can connect or link two mongoose model using ref
         }
} , { timestamps : true  })


const Task = mongoose.model('Task', taskSchema)

module.exports = Task