const mongoose=require('mongoose')
const userModel = require('../models/userModel')
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt");
const crypto=require('crypto');
const axios=require("axios");
const emailjs=require("@emailjs/browser")
const SECRET_KEY = process.env.SECRET_KEY||"1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8";
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY||"14c5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j7k8";
//getalluserprofile

exports.getAllUsers=async(req,res)=>{
    try{
        const Users=await userModel.find({})
        if(!Users){
           return res.status(200).send({
                success:true,
                message:"No Users found"
            })
        }
       return res.status(200).send({
            success:true,
            message:"Users found",Users
        })
        
    }
    catch(error){
        console.log("Error in getting all users")
       return res.status(500).send({
            success:false,
            message:"Error in getting Users Profile",error,
        })
    }
}

//get user profile by username

exports.getProfileByUsername=async(req,res)=>{
    try{
        const {username}=req.body
        const User=await userModel.findOne({username})
        if(!User){
            return res.status(500).send({
                success:false,
                message:"User not found",
            })
        }
       return res.status(200).send({
            success:true,
            message:"User found",User
        })

    }
    catch(error){
        console.log("Error in getting user")
       return res.status(500).send({
            success:false,
            message:"Error in getting User Profile",error,
        })
    }
}
//createUser
exports.createUser = async (req, res) => {
    try {
        const { username,email, password } = req.body;

        // Check if username or password is missing
        if (!username || !password || !email) {
            return res.status(400).send({
                success: false,
                message: "Username/Password/Email is missing",
            });
        }

        // Check if username already exists
        const user = await userModel.findOne({ username });
        if (user) {
            return res.status(409).send({
                success: false,
                message: "Username already exists",
            });
        }
        const user1=await userModel.findOne({email});
        if(user1){
            return res.status(409).send({
                success: false,
                message: "Email already in use",
        
            });
        }
        // Hash the password with bcrypt
        const saltRounds = 10; // You can adjust the salt rounds as needed
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create and save the new user
        const newUser = new userModel({ username,email, password: hashedPassword });
        await newUser.save();

        return res.status(201).send({
            success: true,
            message: "New User Profile Created",
            newUser,
        });
    } catch (error) {
        console.error("Error in creating user profile:", error);
        return res.status(500).send({
            success: false,
            message: "Error in creating user profile",
            error,
        });
    }
};

//login

exports.loginUser=async(req,res)=>{
    try{

        const {email,password}=req.body

        if(!email||!password){
            return res.status(400).send({
                success: false,
                message: "Username/Password is missing",
            });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        const isPasswordMatch=await bcrypt.compare(password,user.password)
        if(!isPasswordMatch){
            return res.status(400).send({
                success: false,
                message: "Invalid password",
            });
        }
        //access token
        const username=user.username;
        const accessToken=jwt.sign(
            {id:user._id,username:user.username},
            SECRET_KEY,
            {expiresIn:'15m'}
        )
        //refresh token
        const refreshToken=jwt.sign(
            {id:user._id,username:user.username},
            REFRESH_SECRET_KEY,
            {expiresIn:'7d'}
        )
        const updatedUser = await userModel.findOneAndUpdate(
            { username },
            { refreshToken }, // Update refreshToken field
            { new: true } // Return the updated user document
        );
        return res.status(200).send({
            success: true,
            message: "Login successful",
            username,
            accessToken,
            refreshToken,
        });
    }
    catch(error){

        console.error("Error in user login", error);
        return res.status(500).send({
            success: false,
            message: "Error in user login",
            error,
        });

    }
}
//sendotp
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
exports.sendOTP=async(req,res)=>{
    try{
        const email=req.body;
        if(!email){
            return res.status(400).send({
                success:false,
                message:"Email is required"
            })
        }
        const otp=generateOtp();
        const service_id= process.env.emailjs_service_id;
        const template_id= process.env.emailjs_template_id;
        const  user_id= process.env.emailjs_public_key;
        const templateParams={
            email:"aryagandhi75@gmail.com",
            passcode:otp
        }
        emailjs
        .send(service_id, template_id,{},{
            publicKey: user_id,
        })
        .then(
            (response) => {
            console.log('SUCCESS!', response.status, response.text);
            },
            (err) => {
            console.log('FAILED...', err);
            },
        );
        
    }
    catch(error){
        console.log("Error in sending otp :"+error);
        return res.status(400).json({ message: 'Error in sending otp:   '+error,success:false });

    }
}

//refreshtokenendpoint

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).send({
                success: false,
                message: "Refresh token is required",
            });
        }

        // Find the user with the given refresh token
        const user = await userModel.findOne({ refreshToken });
        if (!user) {
            return res.status(403).send({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Verify the refresh token
        jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: "Invalid or expired refresh token",
                });
            }

            // Generate a new access token
            const accessToken = jwt.sign(
                { id: user._id, username: user.username },
                SECRET_KEY,
                { expiresIn: '15m' }
            );

            return res.status(200).send({
                success: true,
                message: "Access token refreshed",
                accessToken,
            });
        });
    } catch (error) {
        console.error("Error in refreshing token", error);
        return res.status(500).send({
            success: false,
            message: "Error in refreshing token",
            error,
        });
    }
};

//delete user profile
exports.deleteUser=async(req,res)=>{

    try{
        const {username}=req.body;
        if(!username){
            return res.status(500).send({
                 success:false,
                 message:"Username/Password is missing"
             })
         }
        const user=await userModel.findOne({username});
         const userdeleted=await userModel.findByIdAndDelete(user.id);
        if(!userdeleted){
            return res.status(500).send({
                success:false,
                message:"User not found/Incorrect username/password"
            })
        }

        return res.status(201).send({
            success:true,
            message:"User Profile Deleted",user
        })


    }

    catch(error){
        console.log("Error in deleting user profile")
       return res.status(500).send({
            success:false,
            message:"Error in deleting user Profile",error,
        })
    }


}

//forgot_password
exports.forgotPassword=async(req,res)=>{
    try{
        const {email,username}=req.body;
        
    }
    catch(error){

    }
}

//logout
exports.logoutUser = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).send({
                success: false,
                message: "Username is required",
            });
        }

        // Find the user in the database
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Clear the refresh token
        user.refreshToken = null;
        await user.save();

        return res.status(200).send({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        console.error("Error in user logout", error);
        return res.status(500).send({
            success: false,
            message: "Error in user logout",
            error,
        });
    }
};
