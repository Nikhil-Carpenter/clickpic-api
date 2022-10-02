const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is Mandatory"]
    },
    username:{
        type:String,
        required:[true,"Enter Username"],
        unique:[true,"Username Already Taken"],
        minLength:[2,"Username should be of 2 or more letters"]
    },
    email:{
        type:String,
        required:[true,"Email is Mandatory"],
        unique:[true,"Email already exists"],
    },
    password:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:["public","private"],
        default:"public",
    },
    profilePic:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
    },
    bio:{
        type:String,
    },
    link:{
        type:String,
    },
    chatList:[{
        type:mongoose.Types.ObjectId,
        ref:"users",
    }],
    savedList:[{
        type:mongoose.Types.ObjectId,
        ref:"posts"
    }]

},{timestamps:true})


const userModel = mongoose.model("users",userSchema);

module.exports = userModel;