const express=require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { generateMine, reveal_a_square, cashOut } = require('../controller/minesController');

const router=express.Router();

router.post("/generateMine",generateMine);
router.post("/revealMineSquare",reveal_a_square);
router.post("/cashOut",cashOut)
module.exports=router