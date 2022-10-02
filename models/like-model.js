const mongoose = require("mongoose");

const likeSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts",
    }
},{timestamps:true})

const likeModel = mongoose.model("likes",likeSchema);

module.exports = likeModel;