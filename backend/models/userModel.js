const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true

    },
    refreshToken:{
        type:String
    },
    otp:{
        type:String
    },
    otpExpiresAt:{
        type:Date
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    }

})
const  userModel=mongoose.model('User',userSchema);
module.exports=userModel;