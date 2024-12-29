import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Post } from "../models/postSchema.js";

// Get all posts with pagination and search
export const getAllPosts = catchAsyncErrors(async (req, res, next) => {
  const { searchKeyword, page = 1, limit = 4, category } = req.query;
  const query = {};

  // Filter by search keyword if provided
  if (searchKeyword) {
    query.$or = [
      { title: { $regex: searchKeyword, $options: "i" } },
      { content: { $regex: searchKeyword, $options: "i" } },
    ];
  }

  // Filter by category if provided
  if (category) {
    query.category = category;
  }

  const skip = (page - 1) * limit;
  const totalPosts = await Post.countDocuments(query);

  const posts = await Post.find(query)
    .populate('author', 'name avatar')
    .populate('comments.user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    posts,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalPosts / limit),
    totalPosts,
  });
});

// Get single post
export const getSinglePost = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name avatar')
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });

  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  res.status(200).json({
    success: true,
    post
  });
});

// Like/Unlike post
export const toggleLike = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: isLiked ? "Post unliked" : "Post liked",
    userId: req.user._id,
    postId: post._id
  });
});

// Add comment
export const addComment = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  const comment = {
    user: req.user._id,
    content: req.body.content,
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();

  // Fetch the updated post with populated comments
  const updatedPost = await Post.findById(req.params.id)
    .populate('author', 'name avatar')
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });

  res.status(200).json({
    success: true,
    post: updatedPost
  });
});

// Delete comment
// In postController.js
export const deleteComment = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // You might want to add this additional security check
  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }

  // Add this check to ensure only comment owner can delete
  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to delete this comment", 403));
  }

  // Filter out the comment to be deleted
  post.comments = post.comments.filter(
    comment => comment._id.toString() !== req.params.commentId
  );

  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully"
  });
});
// Increment share count
export const incrementShareCount = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  post.shareCount += 1;
  await post.save();

  res.status(200).json({
    success: true,
    shareCount: post.shareCount
  });
});

// Edit comment
export const editComment = catchAsyncErrors(async (req, res, next) => {
  const { content } = req.body;
  const { id: postId, commentId } = req.params;
  
  if (!content) {
    return next(new ErrorHandler("Comment content is required", 400));
  }

  const post = await Post.findById(postId);
  
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  // Find and update the comment
  const comment = post.comments.id(commentId);
  if (!comment) {
    return next(new ErrorHandler("Comment not found", 404));
  }

  // Check if user is comment owner
  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to edit this comment", 403));
  }

  comment.content = content;
  await post.save();

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    comment
  });
});

// Get user's liked posts
export const getLikedPosts = catchAsyncErrors(async (req, res, next) => {
  const posts = await Post.find({
    likes: req.user._id
  })
  .populate('author', 'name avatar')
  .populate('likes', 'name avatar')
  .populate('comments.user', 'name avatar')
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    posts
  });
});

// Check if user has liked a post
export const checkLikeStatus = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler("Post not found", 404));
  }

  const isLiked = post.likes.includes(req.user._id);

  res.status(200).json({
    success: true,
    isLiked
  });
});
