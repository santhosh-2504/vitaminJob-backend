import express from "express"
import { getAllPosts, getSinglePost, toggleLike, addComment, deleteComment, incrementShareCount, editComment, getLikedPosts, checkLikeStatus } from "../controllers/postController.js"
import { isAuthenticated } from "../middlewares/auth.js"

const router = express.Router();

router.get('/posts', getAllPosts);
router.get('/posts/:id', getSinglePost);
router.post('/posts/:id/like', isAuthenticated, toggleLike);
router.post('/posts/:id/comment', isAuthenticated, addComment);
router.delete('/posts/:id/comment/:commentId', isAuthenticated, deleteComment);
router.post('/posts/:id/share', incrementShareCount);
router.put('/posts/:id/comment/:commentId', isAuthenticated, editComment);
router.get('/posts/liked', isAuthenticated, getLikedPosts);
router.get('/posts/:id/like-status', isAuthenticated, checkLikeStatus);

export default router;