const express = require("express");
const mongoose = require("mongoose");
// Creating the router object
const router = express.Router();


// custom module imports
const chatModel = require("../models/chat-model");
const userModel = require("../models/user-model");
const verifyToken = require("../verify-token");

// Endpoint to load ChatList

router.get("/chatlist/:id",verifyToken,(req,res)=>{
    let userId = req.params.id;

    userModel.findById(userId).populate("chatList")
    .then((user)=>{
        res.send({success:true,user:user})
    })
    .catch((err)=>{
        console.log(err)
        res.send({success:false,message:"Somethin went wrong Getting ChatList"})
    })
})

// Endpoint to send a message
router.post("/create",verifyToken,(req,res)=>{

    let chat = req.body;

    chatModel.create(chat)
    .then((doc)=>{
        console.log(doc)
        res.send({message:"Chat created successfully"})
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"Some Problem while creating the chat message"})
    })
})

// Endpoint to get a conversation

router.get("/chats/:userId/:chatterId",verifyToken,(req,res)=>{

    let userId = mongoose.Types.ObjectId(req.params.userId);
    let chatterId = mongoose.Types.ObjectId(req.params.chatterId);

    console.log(userId,chatterId)

    chatModel.find({$or:[{sender:userId,receiver:chatterId},{sender:chatterId,receiver:userId}]})
    .then((chats)=>{
        // console.log(chats)
        res.send({success:true,chats:chats})
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"Some Problem while getting chats"})
    })  


})

// Exporting the chat routers
module.exports = router;