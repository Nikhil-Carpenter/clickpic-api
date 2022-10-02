const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    comment:{
        type:String,
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts",
    }
},{timestamps:true})

const commentModel = mongoose.model("comments",commentSchema);

module.exports = commentModel;