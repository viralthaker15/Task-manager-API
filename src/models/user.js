const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    Name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique: true,
        trim : true,  
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Please Provide valid Email Address')
            }
        }
    },
    password :{
        type : String, 
        required : true,
        minlength : 7,
        trim : true,
        validate(value)
        {
            if(value.toLowerCase().includes('password'))
            {
                throw new Error('Password cannot contain "password"')
            }
        }   
    },
    age : {
        type : Number,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive Number')
            }
        }
    },

    tokens : [{
        token : {
            type : String,
            required : true
        }
    }] ,

    avatar : {
        type : Buffer
    }
} , { timestamps : true })

userSchema.virtual('tasks', {
    ref : 'Task',
    localField : '_id' ,
    foreignField : 'owner'
})

//userSchema.statics is used to create methods on Model like User for example - model methods
//while userSchema.methods is used to create methods on model instances like user for example - instance methods


userSchema.methods.generateAuthToken = async function(){
    const user = this // here this will be the object you will call this method on
    const token = jwt.sign({_id : user._id.toString()} , process.env.JWT_SECRET)
   
   user.tokens = user.tokens.concat({ token })
   await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email , password) => {
    const user = await User.findOne({ email })

    if(!user)
        throw new Error('Unable to login !')

    const isMatch = await bcrypt.compare(password , user.password)
    
    if(!isMatch)
        throw new Error('Unable to login !')

    return user
}

//toJSON methods get called whenever JSON.stringfy is called
//JSON.stringify is called automatically by express whenever we send object in res
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
     
    return userObject
}

//pre method is used to do something before save function of mongoose is called
// Hashing the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password'))
        user.password = await bcrypt.hash(user.password , 8)

    next()
}) //middleware function

//Delete user teasks when user is removed
userSchema.pre('remove' , async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User',userSchema)  //if we have to use middleware methods for some preprocessing like password hashing
                                                //we have to explicitly create mongoose schema in order to use that
module.exports = User
