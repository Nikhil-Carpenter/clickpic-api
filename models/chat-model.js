const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    message:{
        type:String,
        required:true,
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
},{timestamps:true})

const chatModel = mongoose.model("chats",chatSchema);

module.exports = chatModel;