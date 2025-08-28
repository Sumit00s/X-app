import express from "express"
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/",(req,res)=>{
    res.send("Hello from server");
})

app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/comments",commentRoutes);

// Error handling middleware
app.use((err,req,res)=>{
    console.error("Unhandled error:",err);
    res.status(500).json({error:err.message || "Internal Server Error"});
})

const startServer = async () =>{
    try{
        await connectDB();
        app.listen(ENV.PORT,()=>{console.log(`Server is Running on Port : ${ENV.PORT}`)})
    }catch(error){
        console.log("Failed to start server",error);
        process.exit(1);
    }
}

startServer();
