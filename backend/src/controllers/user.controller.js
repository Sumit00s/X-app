import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { clerkClient, getAuth } from "@clerk/express";

export const getUserProfile = async(req,res) =>{
    try{
        const {username} = req.params;
        const user = await User.findOne({username});

        if(!user) return res.status(404).json({error:"User not found"});

        res.status(200).json({user});
        
    }
    catch(error){
        console.log("Error In Get User By Profile");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const updateProfile = async(req,res)=>{
    try{
        const {userId} = getAuth(req);
        const user = await User.findOneAndUpdate({clerkId:userId},req.body,{new:true});
        if(!user) return res.status(404).json({error:"User not found"});

        res.status(200).json({user});
    }
    catch(error){
        console.log("Error In Update User Profile");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const syncUser = async(req,res)=>{
   try{
        const {userId} = getAuth(req);

        // check if user already exists
        const existingUser = await User.findOne({clerkId:userId});
        if(existingUser) return res.status(200).json({user:existingUser,message:"User already exists"});

        const clerkUser = await clerkClient.users.getUser(userId);

        const userData = {
            clerkId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
            profilePicture: clerkUser.imageUrl || "",
        };
        
        const user = await User.create(userData);

        res.status(201).json({user,message:"User created successfully"});
   }
   catch(error){
        console.log("Error In Sync User Profile");
        res.json({
            success:false,
            error:error.message
        })
    }
    
}

export const getCurrentUser = async(req,res) =>{
    try{
        const {userId} = getAuth(req);
        const user = await User.findOne({clerkId:userId});

        if(!user) return res.status(404).json({error:"User not found"});

        res.status(200).json({user});
    }
    catch(error){
        console.log("Error In Get Current User Profile");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const followUser = async(req,res) =>{
    try{
        const {userId} = getAuth(req);
        const {targetUserId} =  req.params;

        if(userId == targetUserId) return res.status(400).json({error:"You cannot follow yourself"});

        const currentUser = await User.findOne({clerkId:userId});
        const targetUser = await User.findById({targetUserId});

        if(!currentUser || !targetUser) return res.status(404).json({error:"User not found"});

        const isFollowing = currentUser.following.includes(targetUserId);

        if(isFollowing){
            // unfollow
            await User.findByIdAndUpdate(currentUser._id,{
                $pull: {following: targetUserId},
            });

            await User.findByIdAndUpdate(targetUserId,{
                $pull: {followers:currentUser._id},
            });
        }
        else{
            // follow
            await User.findByIdAndUpdate(currentUser._id,{
                $push: {following: targetUserId},
            });

            await User.findByIdAndUpdate(targetUserId,{
                $push: {followers:currentUser._id},
            });

            await Notification.create({
                from: currentUser._id,
                to: targetUserId,
                type: "follow",
            });
        }

        res.status(200).json({
            message: isFollowing ? "User unFollowed successfully" : "User followed successfully",
        });
    }
    catch(error){
        console.log("Error In Follow User");
        res.json({
            success:false,
            error:error.message
        })
    }
}