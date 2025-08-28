import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";


export const getNotifications = async(req,res)=>{
    try{
        const {userId} = getAuth();

        const user = await User.findOne({clerkId:userId});
        if(!user) return res.status(404).json({error:"User not found"});

        const notifications = await Notification.find({to:user._id})
            .sort({createdAt:-1})
            .populate("from","username firstName lastName profilePicture")
            .populate("post","content image")
            .populate("comment","content");

        res.status(200).json({notifications});
    }
    catch(error){
        console.log("Error in get Notication controller");
        res.status(400).json({error:"Error in get notification controller"});
    }
}

export const deleteNotification = async(req,res)=>{
    try{
        const {userId} = getAuth(req); 
        const {notificationId} = req.params;

        const user = await User.findOne({clerkId:userId});
        if(!user) return res.status(404).json({error:"User not found"});

        const notification = await Notification.findOneAndDelete({
            _id:notificationId,
            to:user._id,
        });

        if(!notification) return res.status(404).json({error:"Notification not found"})

        res.status(200).json({message:"Notification deleted Successfully"});
    }
    catch(error){
        console.log("Error Occured in Delete Notification controller")
        res.status(400).json({error:"Error in Delete NOtification Controller"});
    }
}