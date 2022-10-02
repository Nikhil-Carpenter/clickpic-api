const mongoose = require("mongoose");

const connectionSchema = mongoose.Schema({
    follower:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    following:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    status:{
        type:String,
        default:"accepted",
        enum:["accepted","pending"]
    }
},{timestamps:true})

const connectionModel = mongoose.model("Connections",connectionSchema);

module.exports = connectionModel;