const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const mongoose = require("mongoose");

// Creating the router object
const router = express.Router();

// custom module imports
const postModel = require("../models/post-model");
const likeModel = require("../models/like-model");
const commentModel = require("../models/comment-model");

const verifyToken = require("../verify-token");
const userModel = require("../models/user-model");

// For creating a post
router.post("/create",verifyToken,(req,res)=>{  
    // console.log(req.body)
    
    const form = new formidable.IncomingForm();
    form.parse(req,(err,fields,files)=>{
        if(!err){
           let ext = files.contents.originalFilename.split(".")[1].toLowerCase(); 

           if(ext==="jpg"||ext==="jpeg"||ext==="png"||ext==="mp4"||ext==="webp"){

                let newFilePath = "/posts/"+files.contents.newFilename+"."+ext;
                let newFilename = `http://localhost:8000/pics/${files.contents.newFilename}.${ext}`;
                fs.readFile(files.contents.filepath,(err,fileContent)=>{
                    if(!err){
                        fs.writeFile("./"+newFilePath,fileContent,(err)=>{
                            if(!err){
                                fields.contents = [newFilename];
                                // console.log(fields);
                                if(ext === "mp4"){
                                    fields.fileType = "VIDEO"
                                }
                                postModel.create(fields)
                                .then(doc=>{
                                    res.send({message:"File Upload Success",success:true});
                                })
                                .catch((err)=>{
                                    console.log(err);
                                    res.send({message:"Some Problem Try Again!!!",success:false});
                                })

                            }
                        })
                    }
                })

                // res.send({message:"File Upload Success",success:true});

           }else{
             res.send({success:false,message:"file type not supported"})
           }
        }
    })
    // res.send({message:"Post created successfully"})
})

// TO get all the post for a particular user 
router.get("/userposts/userId",verifyToken,(req,res)=>{

    let userId = req.params.userId;

    postModel.find({user:userId}).populate("user")
    .then((posts)=>{
        // console.log(posts)
        res.send(posts);
    })
    .catch((err)=>{
        console.log(err)
        res.send({message:"Some issue while fetching posts"})
    })
})

//  To get info about a single post

router.get("/:postId",verifyToken,(req,res)=>{
    let postId = req.params.postId;

    postModel.findOne({_id:postId})
    .then((post)=>{
        // console.log(post);
        res.send(post)
    })
    .catch((err)=>{
        console.log(err)
        res.send({message:"Some issue while fetching post"})
    })
})


// To delete a Particuler a post

router.delete("/:postId",verifyToken,(req,res)=>{
    let postId = req.params.postId;

    postModel.deleteOne({_id:postId})
    .then((info)=>{
        // console.log(info);
        res.send({success:true,message:"Post deleted successfully"})
    })
    .catch((err)=>{
        console.log(err)
        res.send({message:"Some issue while deleting the post"})
    })
})

// End point to like a post

router.post("/like",verifyToken,(req,res)=>{
     
    likeModel.create(req.body)
    .then( (like)=>{
        res.send({like:like,success:true,message:"Like successfull"})
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"Some issue while Liking the post"});
    })
})

// Endpoint to unlike a post

router.delete("/unlike/:postId",verifyToken,(req,res)=>{
     
    let postId = req.params.postId;

    likeModel.findByIdAndDelete(postId)
    .then((info)=>{
        res.send({success:true,message:"unlike successfull"})
    })
    .catch((err)=>{
        console.log(err);
        res.send({success:false,message:"Some issue while uniking the post"});
    })
})


// End point to commente a post

router.post("/comment",verifyToken,(req,res)=>{
    
    commentModel.create(req.body)
    .then( async (cmt)=>{
        // console.log(comment);
        let comment = await commentModel.findById(cmt._id).populate("user").sort({createdAt:-1}).limit(2);
        res.send({comment:comment,success:true,message:"Comment successfull"})
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"Some issue while Commenting on the post"});
    })
})

// EndPoint to get all the comments for a particular(single) post

router.get("/comments/:postId",verifyToken, async (req,res)=>{
    
    let comments = await commentModel.find({post:req.params.postId}).populate("user").sort({createdAt:-1});
    res.send({success:true,comments});

})

// ENd point to delete one comment

router.delete("/comment/:commentId",verifyToken,(req,res)=>{
    let commentId = req.params.commentId;

    commentModel.deleteOne({_id:commentId})
    .then((info)=>{
        // console.log(info);
        res.send({success:true,message:"Comment deleted successfully"})
    })
    .catch((err)=>{
        console.log(err)
        res.send({message:"Some issue while deleting the Comment"})
    })
})

//Endpoin to save a post

router.put("/savepost/:userId",verifyToken,async(req,res)=>{
    let userId = req.params.userId;
    let data = req.body;

    let user = await userModel.findById(userId);
    if (!user.savedList.includes(mongoose.Types.ObjectId(data.postId))) {
        user.savedList.push(data.postId);

        userModel.findByIdAndUpdate(userId,user)
        .then((data)=>{
            // console.log(post);
            res.send({data,success:true})
        })
        .catch((err)=>{
            console.log(err)
            res.send({message:"Some issue while saving post"})
        })
    }
})

// endpoin to get saved post list

router.get("/savedlist/:id",verifyToken,(req,res)=>{
    let userId = req.params.id;

    userModel.findById(userId).populate("savedList")
    .then((user)=>{
        res.send({success:true,savedPosts:user.savedList})
    })
    .catch((err)=>{
        console.log(err)
        res.send({success:false,message:"Somethin went wrong Getting savedList"})
    })
})


// Exporting the user routers
module.exports = router;