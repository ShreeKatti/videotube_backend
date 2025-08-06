import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import {Like} from "../models/like.models.js";


const toggleVideoLike = asyncHandler(async(req, res) =>{
    const {videoId} = req.params;
    const userId = req.user?._id;

    const likeVideo = await Like.findone({video:videoId,likedBy:userId});

    if(likeVideo){
        await Like.findByIdAndDelete(likeVideo._id);
        return res 
        .status(200)
        .json(new ApiResponse(200,null,"video unliked"))
    }else{
        likeVideo = await Like.create({video:videoId,likedBy:userId});

        return res.status(200).json(new ApiResponse(200,null,"video Liked"))
    }
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} =req.params;
    const user = req.user?._id;

    try {
        const commentLike = await Like.findone({
            comment:commentId,
            likedBy:userId,
        })

        if(commentLike){
                await Like.findByIdAndDelete(commentLike._id)
                return res.status(200).json(new ApiResponse(200,null,"Comment unliked"))
            }

        else{
            commentLike = await Like.create({comment:commentId,likedBy:userId})

            return res.status(200,null,"comment Liked")
        }
    } catch (error) {
        throw new ApiError(401,error?.message||"Toggle Comment Failed")
    }
})


const toggleTwitterLike = asyncHandler(async(req,res)=>{
    const {twitterId} =req.params;
    const userId = req.user?._id;
    
    try {
        const twitterLike = await Like.findone({twitter:twitterId,likedBy:userId})

        if(twitterLike){
            await Like.findByIdAndDelete(twitterLike._id)
            return res.status(200).json(new ApiResponse(200,null,"Twitter Unliked"))

        }

        else{
            twitterLike = await Like.findone({twitter:twitterId,likedBy:userId});
            return res.status(200).json(new ApiResponse(200,null,"twitter liked"))
        }
    } catch (error) {
        throw new ApiError(500,error?.message ||"toggle tweet failed")
    }
})


const getLikedVideos = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;

    try{
        const likedVideos = await Like.aggregate([
            {
                $match:{
                    likedBy:new mongoose.Types.ObjectId(userId),
                },
            },{
                $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"_id",
                    as:"likedVideo",
                    pipeline:[
                        {
                            $match:{
                                isPublished:true
                            },
                        },
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"ownerDetails",
                            },
                        },{
                            $unwind:"$ownerDetails",
                        },
                    ],
                },
            },{
                $unwind:"$likedVideo",
            },{
                $project:{
                    _id:0,
                    likeVideo:{
                        _id:1,
                        "video.url":1,
                        "thumbnail.url":1,
                        owner:1,
                        title:1,
                        description:1,
                        views:1,
                        duration:1,
                        createdAt:1,
                        isPublished:1,
                        ownerDetails:{
                            username:1,
                            fullname:1,
                            "avatar.url":1,
                        },
                    },
                },
            },
        ]);

        return res
        .status(200)
        .json(new ApiResponse(200,likedVideos,"Liked Videos fetched Successfully"))
    }

    catch(error){
        new ApiError(402,error?.message ||"Failed to get Liked videos")
    }
})

export {toggleCommentLike,toggleTwitterLike,toggleVideoLike,getLikedVideos}