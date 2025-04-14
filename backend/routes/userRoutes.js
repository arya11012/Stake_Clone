const express=require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { getAllUsers, createUser, getProfileByUsername, deleteUser, loginUser, logoutUser, refreshToken, sendOtp, verifyOtp, sendOTP } = require('../controller/userController');

const router=express.Router();

router.get('/getAllUsers',getAllUsers)
router.get("/getProfileByUsername",getProfileByUsername)
router.post("/createUser",createUser)
router.delete("/deleteUser",authenticateToken,deleteUser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.post("/refreshToken",refreshToken)
router.post("/sendOTP",sendOTP);
//router.post("/sendOtp",sendOtp)
//router.post("/verifyOtp",verifyOtp)
module.exports=router