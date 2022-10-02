const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    contents:[String],
    caption:{
        type:String,
    },
    location:{
        type:String,
    },
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    fileType:{
        type:String,
        default:"IMAGE"
    }
    

},{timestamps:true})

const postModel = mongoose.model("posts",postSchema);

module.exports = postModel;