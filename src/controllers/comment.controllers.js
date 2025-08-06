import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const getVideoComments = asyncHandler(async(req , res) =>{
    const {videoId}= req.param;
    const {page=1,limit=10}= req.query;
    const isGuest = req.query.guest === "true";

    if(!isValidObjectId(videoId)) throw new ApiError(401,"Invalid VideoID");

    const video = await Video.findById(videoId);

    if(!video) throw new ApiError(404,"Video not Found");

    const commentsAggregate = Comment.aggregate([
       { $match:{
            video:new mongoose.Types.ObjectId(videoId),
        },
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
            },
        },
                {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes",
            },
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes",
                },
                owner:{
                    $first:"$owner",
                },
                isLiked:{
                    $cond:{
                        if:isGuest,
                        then:false,
                        else:{
                            $cond:{
                                if:{$in:[req.user?._id,"$likes.likedBy"],
                                    then:true,
                                    else:false,
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            $sort:{
                createdAt:-1,
            },
        },
        {
            $project:{
                content:1,
                createdAt:1,
                likesCount:1,
                owner:{
                    username:1,
                    fullname:1,
                    "avatar.url":1,
                    _id:1,
                },
                isLiked:1,
            },
        },
    ]);



    if(!commentsAggregate){
        throw new ApiError(500,"Error creating comments Aggregate");
    }

    const options = {
        page:parseInt(page,10),
        limit:parseInt(limit,10),
    };

    const comments = await Comment.aggregatePaginate(commentsAggregate,options);

    if(!comments) throw new ApiError(501,"Comments Pagination Failed");


    return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"Video comements fetched Successfully")
    );
})


const addComment =asyncHandler(async(req,res )=>{
    const{videoId} = req.params;
    const{content} = req.body;

    if(!content) throw new ApiError(404,"Comment content is required")
    const comment = await Comment.create({
        video:videoId,
        content,
        owner:req.user._id,
})

    if(!comment) throw new ApiError(500,"Error Adding Comment");

    return res 
    .status(200)
    .json(
        new ApiResponse(200,Content,"Comment added")
    );

})


const updateComment =asyncHandler(async(req,res) =>{
    const{commentId} = req.params;
    const{content}=req.body;

    if(!content) throw new ApiError(401,"Add the Content please");

    if(!isValidObjectId(commentId)){
        throw new ApiError(404,"Comment not Found")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){ throw new ApiError(401, "Comment doesnt exists");}

    if(comment?.owner.toString()!== req.user?._id.toString()){
        throw new ApiError(401,"only Comment owner can edit their comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{content}
        },
        {
            new:true
        }
    );

    if(!updatedComment) throw new ApiError(402,"Error in updating Comment")


    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"Comment updated SuccessFully")
    )
});


const deleteComment = asyncHandler(async(req,res) =>{
    const{commentId} = req.params;
    const {userId} = req.user?._id;
    
    if(!isValidObjectId(commentId)){
        throw new ApiError(402,"invalid Comment id")
    }

    const comment = await Comment.findById(commentId);

    if(!comment) throw new ApiError(500,"Comment not found")

    if(comment?.owner.toString() !== userId.toString()){
        throw new ApiError(500,"Comment can be deleted by owner itself")
    }
    await findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(
        new ApiResponse(200,null,"Comment deleted")
    )
}) 


export{getVideoComments,updateComment,addComment,deleteComment};