const mongoose=require('mongoose')

const minesSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    noOfMines:{
        type:Number,
        required:true
    },
    minesArray:{
        type:Array,
        required:true
    },    
    revealedArray:{
        type:Array,
        required:true,
    },
    isGameOver:{
        type:Boolean,
        default:false
    },
    moneySpent:{
        type:Number,
        required:true
    },
    availableReward:{
        type:Number,
        default:0
    },
    revealedMines:{
        type:Number,
        default:0
    }
    

},{timestamps:true})

const minesModel=mongoose.model("mines",minesSchema);
module.exports=minesModel