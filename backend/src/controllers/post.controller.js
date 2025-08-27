import User from "../models/user.model.js"
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudnary.js"

export const getPosts = async(req,res)=>{
    try{
        const posts = await Post.find()
            .sort({createdAt: -1})
            .populate("user","username firstName lastName profilePicture")
            .populate({
                path: "comments",
                populate:{
                    path:"user",
                    select: "username firstName lastName profilePicture",
                },
            });

        res.status(200).json({posts});
    }
    catch(error){
        console.log("Error In Get Posts");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const getPost = async(req,res)=>{
    try{
        const {postId} = req.params;
        const post = await Post.findById(postId)
            .populate("user","username firstName lastName profilePicture")
            .populate({
                path:"comments",
                populate:{
                    path: "user",
                    select: "username firstName lastName profilePicture",
                },
            });
        
        if(!post) return res.status(404).json({error: "Post not found"});

        res.status(200).json({post});
    }
    catch(error){
        console.log("Error In Get Post");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const getUserPosts = async(req,res)=>{
    try{
        const {username} = req.params;

        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error:"User not found"});

        const posts = await Post.find({user:user._id})
            .sort({createdAt: -1})
            .populate("user","username firstName lastName profilePicture")
            .populate({
                path:"comments",
                populate:{
                    path: "user",
                    select: "username firstName lastName profilePicture",
                },
            });
        
        res.status(200).json({posts});
    }
    catch(error){
        console.log("Error In Get User Posts");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const createPost = async(req,res) =>{
    try{
        const {userId} = getAuth(req);
        const {content} = req.body;
        const imageFile = req.file;

        if(!content && !imageFile){
            return res.status(400).json({error:"Post must contain either text or image"});
        }

        const user = await User.findOne({clerkId:userId});
        if(!user) return res.status(404).json({error:"User not found"});

        let imageUrl = "";

        if(imageFile){
            try{
                const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString(
                    "base64"
                )}`;

                const uploadResponse = await cloudinary.uploader.upload(base64Image,{
                    folder:"social_media_posts",
                    resource_type:"image",
                    transformation:[
                        {width:800,height:600,crop:"limit"},
                        {quality:"auto"},
                        {format:"auto"},
                    ],
                });

                imageUrl = uploadResponse.secure_url;
            }
            catch(uploadError){
                console.error("Cloudinary upload Error",uploadError);
                res.status(400).json({
                    success:false,
                    error:"Failed to upload image"
                });
            }
        }

        const post = await Post.create({
            user: user._id,
            content: content || "",
            image:imageUrl,
        });

        res.status(201).json({post});
    }
    catch(error){
        console.log("Error In Create Post");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const likePost = async(req,res) =>{
    try{
        const {userId} = getAuth(req);
        const {postId} = req.params;

        const user = await User.findOne({clerkId:userId});
        const post = await Post.findById(postId);

        if(!user || !post) return res.status(404).json({error:"user or post not found"});

        const isLiked = post.likes.includes(user._id);

        if(isLiked){
            // unlike
            await Post.findByIdAndUpdate(postId,{
                $pull: {like:user._id},
            });
        }
        else{
            // Like
            await Post.findByIdAndUpdate(postId,{
                $push: {like:user._id},
            })

            // Create a notification for that
            if(post.user.toString() != user._id.toString()){
                await Notification.create({
                    from: user._id,
                    to: post.user,
                    type: "like",
                    post: postId,
                });
            }
        }

        res.status(200).json({
            message: isLiked ? "Post unliked successfult" : "Post Liked Successfully",
        });
    }
    catch(error){
        console.log("Error In Liking Post");
        res.json({
            success:false,
            error:error.message
        })
    }
}

export const deletePost = async(req,res) =>{
    try{
       const {userId} = getAuth(req);
       const {postId} = req.params;
       
       const user = await User.findOne({clerkId: userId});
       const post = await Post.findById(postId);

       if(!user || !post) return res.status(404).json({error: "User or post not found"});

       if(post.user.toString() !== user._id.toString()){
         return res.status(403).json({error:"You can only delete your own posts"});
       }

       //delete all comments on this post
       await Comment.deleteMany({post:postId});

       //delete the post
       await Post.findByIdAndDelete(postId);

       res.status(200).json({message:"Post deleted successfully"});
    }
    catch(error){
        console.log("Error In Deleting Post");
        res.json({
            success:false,
            error:error.message
        })
    }
}