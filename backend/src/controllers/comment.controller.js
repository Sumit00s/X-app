import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import { connect } from "mongoose";


export const getComments = async(req,res)=>{
    try{
        const {postId} = req.params;

        const comments = await Comment.find({post:postId})
            .sort({createdAt: -1})
            .populate("user","username firstName lastName profilePicture")

        res.status(200).json({comments});
    }
    catch(error){
        console.log("Error IN getComments controller");
        res.status(400).json({error:"Error while get comments"});
    }
}

export const createComment = async(req,res)=>{
    try{
        const {userId} = getAuth(req);
        const {postId} = req.params;
        const {content} = req.body;

        if(!content || connect.trim() === ""){
            return res.status(400).json({error:"Comment content is required"});
        }

        const user = await User.findOne({clerkId:userId});
        const post = await Post.findById(postId);

        if(!user || !post) return res.status(404).json({error:"User or post not found"});

        const comment = await Comment.create({
            user: user._id,
            post: postId,
            content,
        });

        // link the comment to the post
        await Post.findByIdAndUpdate(postId,{
            $push:{comments:comment._id}
        });

        if(post.user.toString() !== user._id.toString()){
            await Notification.create({
                from:user._id,
                to:post.user,
                type:"comment",
                post:postId,
                comment:comment._id,
            });
        }

        res.status(201).json({comment});
    }
    catch(error){
        console.log("Error in Create Commnet Controller");
        res.status(400).json({error:"Error in create comment controller",error})
    }
}

export const deleteComment = async(req,res)=>{
    try{
        const {userId} = getAuth(req);
        const {commentId} = req.params;

        const user = await User.findById({clerkId:userId});
        const comment = await Comment.findById(commentId);

        if(!user || !comment){
            return res.status(404).json({error:"User or comment not found"});
        }

        if(comment.user.toString() != user._id.toString()){
            return res.status(403).json({error:"Yourt can only delete your own comments"});
        }

        // remove comment from post
        await Post.findByIdAndUpdate(comment.post,{
            $pull: {comments:commentId},
        });

        // delete the content
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({message:"Comment deleted successfullu"});
    }
    catch(error){
        console.log("Error in delete controller");
        res.status(400).josn({error:"Error while deleting comment",error})
    }
}