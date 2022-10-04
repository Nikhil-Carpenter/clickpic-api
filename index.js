const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const {Server} = require("socket.io");
let port = process.env.PORT || 8000;

// console.log(process.env.PORT)

const app = express();

// Creating a Server by http for socket
const server = http.createServer(app)

// Custom router imports
const userRouter = require("./routes/user")
const postRouter = require("./routes/post")
const connectionRouter = require("./routes/connection")
const chatRouter = require("./routes/chat");
const chatModel = require("./models/chat-model");
// const e = require("express");

// Middleware setup
app.use(express.json());
app.use(cors());

// Setting up Routes
app.use("/users",userRouter);
app.use("/posts",postRouter);
app.use("/connections",connectionRouter);
app.use("/chats",chatRouter);

app.use("/pics",express.static("./posts"));
app.use("/profile/pics",express.static("./profile-pics"));

// Socket logic

const io = new Server(server,{
    cors:{
        origin:"https://clickpic-app.netlify.app/",
        methods:["GET","POST"]
    }
});

io.on("connection",(socket)=>{

    // joining the received channel id from fr-end
    socket.on("create_channel",(data)=>{
        socket.join(data)
    })

    // receiving the message

    socket.on("send_message",(chat)=>{

        chatModel.create(chat)
        .then((doc)=>{
            // console.log(doc)
                let userId = chat.sender;
                let chatterId = chat.receiver;

                chatModel.find({$or:[{sender:userId,receiver:chatterId},{sender:chatterId,receiver:userId}]})
                .then((chats)=>{
                    // console.log(chat)
                    socket.to(chatterId).emit("load_chat",chats)
                    socket.emit("load_chat",chats)

                    // res.send({message:"Chat created successfully"})
                    // res.send({success:true,chats:chats})
                })
                .catch((err)=>{
                    console.log(err);
                    res.send({message:"Some Problem while getting chats"})
                })  

        })
        .catch((err)=>{
            console.log(err);
            res.send({message:"Some Problem while creating the chat message"})
        })


       
    })
})


// Setting up database
mongoose.connect("mongodb+srv://nikhilcarpenter:Mongodbatlas07pass@cluster0.zo6wkso.mongodb.net/clickpic",{useNewUrlParser:true})
.then(()=>{
    console.log("Database connected successfully")
})




// Setting up backend api Server
server.listen(port,()=>{
    console.log(`Server is up and running on ${port}`);
})