import mongoose from "mongoose";
import {ENV} from "./env.js"

export const connectDB = async()=>{
    try{
        await mongoose.connect(ENV.MONGO_URL);
        console.log("Connected to DB Successfuly")
    }
    catch(error){
        console.log("Error while connecting to Database",error);
        process.exit(1);
    }
}