const express = require("express");
const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const formidable = require("formidable");

const verifyToken = require("../verify-token");
// Custom module imports(model)
const userModel = require("../models/user-model");
const postModel = require("../models/post-model");

const connectionModel = require("../models/connection-model");
const { connection, default: mongoose } = require("mongoose");
const likeModel = require("../models/like-model");
const commentModel = require("../models/comment-model");

// Creating the router object
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nikhilkarpenter007@gmail.com",
    pass: "wrqwcysfgwphhyya",
  },
});

//End point for user creation / registration
router.post("/signup",(req, res) => {
  let user = req.body;

  bcryptjs.genSalt(10, (err, salt) => {

    if (err === null || err === undefined) {
      bcryptjs.hash(user.password, salt, (err, encpass) => {

        if (err === null || err === undefined) {
          user.password = encpass;

            userModel.create(user)
            .then((doc) => {
              // email logic
              let mailBody = {
                from: "nikhilkarpenter007@gmail.com",
                to: user.email,
                subject: "Thank you for Signing up",
                html: `     
                <div style=" text-align:center; font-size:30px; font-weight:bold;padding:30px;line-height:50px;background-color:beige;color:skyblue">
                
                Welcome to ClickPic
                
                </div> `,
              };

              transporter.sendMail(mailBody, (error, message) => {
                if (!error) {
                  console.log(message);
                  console.log("Email sent");
                } else {
                  console.log("Some issue while sending");
                  console.log(error);
                }
              });

              res.status(201).send({success:true, message: "User Registered Successfully" });

            })
            .catch((err) => {
              // console.log();
              if(err.code === 11000){
                
                  res.status(409).send({success:false, message: "Email or username already exist" });
                
              }else{
                res.status(400).send({success:false, message:err.errors.name.properties.message})
              }
             
            });
        }
      });
    }
  });
});

// Endpoint for Logins

router.post("/login", (req, res) => {
  let userCred = req.body;
  // console.log(userCred)
  userModel.findOne({$or:[{ email: userCred.email_username },{ username: userCred.email_username }]})
  .then((user) => {
    // console.log(user)
        if (user !== null) {
            bcryptjs.compare(userCred.password, user.password, (err, result) => {

                if (err === null || err === undefined) {

                    if (result === true) {

                        jwt.sign(userCred,"secretkey",{ expiresIn: "1d" },(err, token) => {

                            if (err === null || err === undefined) {
                                res.status(200).send({
                                    success: true,
                                    token: token,
                                    email: user.email,
                                    userId: user._id,
                                    username:user.username,
                                    profilePic:user.profilePic
                                });
                            }
                        });
                        
                        // res.send({message:"Login Succefull"})
                    } else {
                        res.status(403).send({success:false, message: "Incorrect Password" });
                    }
                }
            });
            
        } else {
        res.status(404).send({success:false, message: "User Not Found" });
        }
    })
    .catch((err) => {
        console.log(err);
        res.status(503).send({ message: "Some err while login user" });
    });
});

// End point to get all the post of the user that i follow and ours

router.get("/posts/:loggedinId",verifyToken, async (req,res)=>{

  let loggedinId = req.params.loggedinId;
  let allFollowing = await connectionModel.find({follower:loggedinId,status:"accepted"})

  // console.log(allFollowing) ,following:- people that loggedin user follow
  
  let allFollowingId = allFollowing.map((eachOneFollwing,idx)=>{
    return eachOneFollwing.following;
  })    //all the following peoples Ids
  
  allFollowingId.push(loggedinId);
  
  // console.log(allFollowingId)
  
  postModel.find({user:{$in:allFollowingId}}).populate("user").sort({createdAt:-1})
  .then(async (allPosts)=>{

      let posts = [];

      for(i=0;i<allPosts.length;i++)
      {
        let post = {...allPosts[i]._doc};

          // fetching likes of every post one by one       
          let likes = await likeModel.find({post:allPosts[i]._id})
          post.likes = likes;

          // fetching top two comment of every post one by one        
          let comments = await commentModel.find({post:allPosts[i]._id}).populate("user").limit(2).sort({createdAt:-1});
          post.comments = comments;

          // fetching comment count of the post
          let commentCount = await commentModel.find({post:allPosts[i]._id}).countDocuments();

          post.commentCount = commentCount;

          posts.push(post);

      }
      // console.log(posts);


    res.send({success:true,posts})
  })
  .catch((err)=>{
    console.log(err);
  })

})

// End point to get 30 random users and their post

router.get("/posts/explore/random/:userId",verifyToken, async (req,res)=>{

  // let users = await userModel.aggregate([{$sample:{size:3}}]);
  // res.send({success:true,users});

  let userId = req.params.userId;

  let allPosts = await postModel.aggregate([
    {
      $match:{"user":{$not:{$eq:mongoose.Types.ObjectId(userId)}}}
    },
    {
      $lookup:{
        from:"users",
        localField:"user",
        foreignField:"_id",
        as:"user"
      }
    },
    {
      $unwind:"$user"
    },
    {
      $match:{
        "user.type":"public"
      }
    },
    {
      $sample:{size:30}
    }
  ])

  // res.send({success:true,posts})
  // console.log(allFollowing) ,following:- people that loggedin user follow
  
  // let allFollowingId = allFollowing.map((eachOneFollwing,idx)=>{
  //   return eachOneFollwing.following;
  // })    //all the following peoples Ids
  
  // allFollowingId.push(loggedinId);
  
  // console.log(allFollowingId)
  
  // postModel.find({user:{$in:allFollowingId}}).populate("user").sort({createdAt:-1})
  // .then(async (allPosts)=>{

      let posts = [];

      for(i=0;i<allPosts.length;i++)
      {
        let post = {...allPosts[i]};

          // fetching likes of every post one by one       
          let likes = await likeModel.find({post:allPosts[i]._id})
          post.likes = likes;

          // fetching top two comment of every post one by one        
          let comments = await commentModel.find({post:allPosts[i]._id}).populate("user").limit(2).sort({createdAt:-1});
          post.comments = comments;

          // fetching comment count of the post
          let commentCount = await commentModel.find({post:allPosts[i]._id}).countDocuments();

          post.commentCount = commentCount;

          posts.push(post);

      }
  //     // console.log(posts);


    res.send({success:true,posts})
  // })
  // .catch((err)=>{
  //   console.log(err);
  // })

})


// End point to get a single user info/ profile info

router.get(`/profile/:username/:loggedinId`, verifyToken,  (req, res) => {
   
  let username = req.params.username;
  let loggedinId = req.params.loggedinId;
  

  userModel
    .findOne({ username: username })
    .then(async (user) => {
      // console.log(user);
      let following = await connectionModel.find({follower:user._id,status:"accepted"});
      let follower = await connectionModel.find({following:user._id,status:"accepted"})
      let connection = {success:true,status:"nothing"};
      // console.log(user._id,loggedinId)

      if(user._id.toString()!==loggedinId){

        connection = await connectionModel.findOne({follower:loggedinId,following:user._id})
        if(connection===null){
          connection = {success:true,status:"nothing"};
        }
        

      }else{
        connection = {success:true,status:"same"}
      }

      postModel.find({user:user._id})
          .then(async (allPosts)=>{
              // console.log(posts)

              let posts = [];

                for(i=0;i<allPosts.length;i++)
                {
                  let post = {...allPosts[i]._doc};

                    // fetching likes of every post one by one       
                    let likes = await likeModel.find({post:allPosts[i]._id})
                    post.likes = likes;


                    // fetching comment count of the post
                    let commentCount = await commentModel.find({post:allPosts[i]._id}).countDocuments();

                    post.commentCount = commentCount;

                    posts.push(post);

                }


              res.send({ username:user.username, success: true, message: "Successfull", user: user,followers:follower,following:following,posts:posts,connection});
          })
          .catch((err)=>{
              console.log(err)
              res.send({message:"Some issue while fetching posts"})
          })

      
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, message: "Some problem while getting user" });
    });

});

// Endpoint for getting userinfo using username

router.get("/search/:username",verifyToken,(req,res)=>{

  let username = req.params.username;

  userModel.find({username: { $regex: username ,$options:"i" } })
  .then((users)=>{
      res.send({success:true,users})
  })
  .catch((err)=>{
    console.log(err);
    res.send({success:false,message:"Some Problem while fetching user"});
  })

})

// ENd point to update the profile data
router.put("/:id",verifyToken,(req,res)=>{

  let userId = req.params.id

  const form = new formidable.IncomingForm()

  form.parse(req,(err,fields,files)=>{
      // console.log(fields)
      // console.log(files)
      if(Object.keys(files).length!==0){

        let fileData = fs.readFileSync(files.profilePic.filepath);
        let ext = files.profilePic.originalFilename.split(".")[1].toLowerCase();

        if(ext==="jpg"|| ext==="png"|| ext==="webp"||ext==="jpeg"){

          let uploadPath = "./profile-pics/"+files.profilePic.newFilename+"."+ext;
          let publicPath = "http://localhost:8000/profile/pics/"+files.profilePic.newFilename+"."+ext;
          fields.profilePic=publicPath;

          fs.writeFileSync(uploadPath,fileData);
          // console.log(fields);
        }

      }

      if(Object.keys(fields)!==0){

        userModel.findByIdAndUpdate(userId,fields)
        .then(async(info)=>{

          let user = await userModel.findById(userId);

          res.send({success:true,message:"Profile Updated",user:user})

        })
        .catch((err)=>{

          console.log(err);

          res.send({success:false,message:"Some Problem while updating profile"})
          
        })
      }
  })

})



// Endpoint to Get the timeline of  a particuler user

router.get("/timeline/:userId",(req,res)=>{
  let userId = req.params.userId;

  postModel.find({user:userId})
  .then( async (allPosts)=>{

    // console.log(allPosts);

    
    //  fetching all the follower even if they are not accepted yet
    let followers = await connectionModel.find({following:userId}).populate("follower").sort({createdAt:-1}).limit(10)
    
    // timelineData = timelineData.concat(followers);
    // let date = new Date();
    // date.setDate(date.getDate()-5); // {createdAt:{$gte:date}}


    let likes = await likeModel.aggregate([
      {
        $lookup:{
          from:"posts",
          localField:"post",
          foreignField:"_id",
          as:"post"
        }
      },
      {
        $unwind:"$post"
      },
      {
        $lookup:{
          from:"users",
          localField:"user",
          foreignField:"_id",
          as:"user"
        }
      },
      {
        $unwind:"$user"
      },
      {
        $match:{
          "post.user":mongoose.Types.ObjectId(userId)
        }
      }
    ])

    let comments = await commentModel.aggregate([
      {
        $lookup:{
          from:"posts",
          localField:"post",
          foreignField:"_id",
          as:"post"
        }
      },
      {
        $unwind:"$post"
      },
      {
        $lookup:{
          from:"users",
          localField:"user",
          foreignField:"_id",
          as:"user"
        }
      },
      {
        $unwind:"$user"
      },
      {
        $match:{
          "post.user":mongoose.Types.ObjectId(userId)
        }
      }
    ])


    // let likes = await likeModel.find().populate("post",null,{user:userId}).populate("user").sort({createdAt:-1}).limit(20);

    // let comments = await commentModel.find().populate("post",null,{user:userId}).populate("user").sort({createdAt:-1}).limit(20);
    
    // let timelineData = [...followers,...likes,...comments];
    res.send({followers,likes,comments,success:true})

  })
  .catch((err)=>{
    console.log(err);
    res.send({success:false,message:"Some issue while fetching timeline data"})
  })
})

// Endpoint to add a Chat person

router.put("/addchat/:id",verifyToken,async (req,res)=>{
  let id = req.params.id;
  let data = req.body;

  let user = await userModel.findById(id);
  // console.log(user)
  
  if (!user.chatList.includes(mongoose.Types.ObjectId(data.chatId))) {
    
    user.chatList.push(data.chatId)
    userModel.findByIdAndUpdate(id,user)
    .then( async (doc)=>{

      let otherUser = await userModel.findById(data.chatId);
      otherUser.chatList.push(id);

        userModel.findByIdAndUpdate(data.chatId,otherUser)
          .then((doc)=>{
            res.send({message:"ChatList Updated",success:true})
          })
          .catch((err)=>{
            console.log(err)
            res.send({message:"Something Went Wrong!!",success:false})
          })

    })
    
    
  }else{
    
    res.send({message:"Already in the ChatList",success:true})
  }



})


// Exporting the user routers
module.exports = router;
