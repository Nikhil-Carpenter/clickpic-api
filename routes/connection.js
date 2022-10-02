const express = require("express");

// Creating the router object
const router = express.Router();

// custom module imports
const verifyToken = require("../verify-token");
const connectionModel = require("../models/connection-model");
const userModel = require("../models/user-model");

router.post("/create",verifyToken,(req,res)=>{

    let connection = req.body;

    // Checking fo private account on backend
     
    userModel.findOne({_id:connection.following})
    .then((userinfo)=>{
        if(userinfo.type==="private"){

            connection.status = "pending";

        }

        connectionModel.create(connection)
            .then((connection)=>{
                res.send({connection,success:true,message:"Connection created successfully"})
            })
            .catch((err)=>{
                console.log(err);
                res.send({message:"Some issue while creating Connection"});
            })
    })
    .catch((err)=>{
        console.log(err)
        res.send({message:"Some problem try again"})
    })

})

// End point to check if person is alredy folloeing

router.get("/checkfollow/:followerId/:followingId",verifyToken,(req,res)=>{


    connectionModel.findOne({follower:req.params.followerId,following:req.params.followingId})
    .then((connection)=>{
        if(connection!==null){
            res.send({success:true,connection,status:"following"});
        }else{
            res.send({success:false,status:"nothing"})
        }
    })
    .catch((err)=>{
        console.log(err)
        res.send({success:false,message:"Unable to fetch Connection"})
    })
})


// Endpoint to see all pending requests for private account 

router.get("/pending/:userId",verifyToken,(req,res)=>{

    let userId = req.params.userId;

    connectionModel.find({following:userId,status:"pending"}).populate("follower").sort({createdAt:-1})
    .then((requests)=>{
        res.send({success:true,requests});
    })
    .catch((err)=>{
        console.log(err)
        res.send({success:false,message:"Unable to fetch follow requests"})
    })
})


// Endpoint to accept a request or Update a connection

router.put("/changestatus/:connectionId",verifyToken,(req,res)=>{

    let connectionId = req.params.connectionId;

    connectionModel.updateOne({_id:connectionId},req.body)
    .then((info)=>{
        res.send({success:true,message:"Connection Updated Successfully"});
    }) 
    .catch((err)=>{
        console.log(err)
        res.send({success:true,message:"Some problem while updating the request"})
    })
})

// Endpoint to unfollow some one or delete someone

router.delete("/connection/:connectionId",verifyToken,(req,res)=>{

    let connectionId = req.params.connectionId;

    connectionModel.deleteOne({_id:connectionId})
    .then((info)=>{
        // console.log(info)
        res.send({status:"nothing",success:true})
    })
    .catch((err)=>{
        console.log(err)
        res.send({message:"Some problem while unfollowing "})
    })

})

// Exporting the user routers
module.exports = router;