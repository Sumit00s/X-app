import express from "express"
import cors from "cors";

import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js";
import notificationRoute from "./routes/notification.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from '@clerk/express';
import { arcjetMiddleware } from "./middleware/archjet.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(arcjetMiddleware);

app.get("/",(req,res)=>{
    res.send("Hello from server");
})

app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/notification",notificationRoute);

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
