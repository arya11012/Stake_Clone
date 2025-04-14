const mongoose=require('mongoose')
const userModel = require('../models/userModel')
const crypto=require('crypto');
const minesModel = require('../models/minesgrid');

exports.generateMine=async(req,res)=>{
    try{
        const {no_of_mines,username,moneySpent}=req.body;
        
        const user=await userModel.findOne({username});
        if(!user){
            return res.status(500).send({
                message:"User not found",
                success:false
            })
        }
        const userId=user._id;
        const mineGamePending=await minesModel.findOne({userId,isGameOver:false});
        if(mineGamePending){
            return res.status(500).send({
                message:"Complete the current game",
                success:false
            })
        }
        const minesSet=new Set();
        while(minesSet.size<no_of_mines){
            minesSet.add(crypto.randomInt(0,25))
        }
        let minesArray=Array(25).fill(0);
        
        minesSet.forEach(num=>{
            console.log(num);
            minesArray[num]=1;
        })
        const revealedArray=Array(25).fill(0);
        const newMine=new minesModel({
            userId,
            minesArray,
            revealedArray,
            noOfMines:no_of_mines,
            isGameOver:false,
            moneySpent
        })
        await newMine.save();
        return res.status(200).send({
            success:true,
            message:"New Mine Created",

        })


    }
    catch(error){
        console.log(error);
        return res.status(400).send({
            success:false,
            message:"Error in creating a mines array"
        })
    }
    

}

exports.reveal_a_square = async (req, res) => {
    try {
        const { no_of_square_clicked, username } = req.body;
        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(500).send({
                message: "User not found",
                success: false
            });
        }

        const userId = user._id;
        const mine = await minesModel.findOne({ userId, isGameOver: false });

        if (!mine) {
            return res.status(404).send({
                message: "No active mine game found",
                success: false
            });
        }

        if (mine.revealedArray[no_of_square_clicked] === 1) {
            return res.status(404).send({
                message: "Square already revealed",
                success: false
            });
        }

        const mineArray = mine.minesArray;
        const moneySpent = mine.moneySpent;
        const minesRevealed = mine.revealedMines+1;
        
        const no_of_mines=mine.noOfMines;
        console.log(`${moneySpent}  ${minesRevealed} ${no_of_mines}`);
        const base = parseFloat((25 / (25 - no_of_mines)).toFixed(4));
        
        const reward=moneySpent*(base**minesRevealed)+100;

        let isMine = mineArray[no_of_square_clicked];

        if (isMine) {
            mine.revealedArray[no_of_square_clicked] = 1;
            mine.isGameOver = true;
            mine.revealedMines =minesRevealed;

            await mine.save();
            return res.status(200).send({
                success: true,
                message: "Mine found on the clicked square",
                isGameOver: true,
                revealedArray: mine.revealedArray,
                mine
            });
        } else {
            mine.revealedArray[no_of_square_clicked] = 1;
            mine.revealedMines =minesRevealed;
            mine.availableReward = reward;

            await mine.save();
            

            return res.status(200).send({
                success: true,
                message: "Mine not found on the clicked square",
                isGameOver: false,
                revealedArray: mine.revealedArray,
                reward,
        
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({
            success: false,
            message: "Error in revealing a square"
        });
    }
};

exports.cashOut=async(req,res)=>{
    try{
        const {username } = req.body;
        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(500).send({
                message: "User not found",
                success: false
            });
        }

        const userId = user._id;
        const mine = await minesModel.findOne({ userId, isGameOver: false });

        if (!mine) {
            return res.status(404).send({
                message: "No active mine game found",
                success: false
            });
        }
        mine.isGameOver=true;
        await mine.save();
        return res.status(200).send({
            message: "Cahsed Out",
            success: true
        });
    }
    catch(error){
        console.log(error);
        return res.status(404).send({
            message: "Erorr in cashing out",
            success: false
        });

    }
}
