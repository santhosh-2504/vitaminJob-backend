import express from "express";
import { getUser, login, logout, register, updatePassword, updateProfile, addBookmark, removeBookmark, getBookmarks, deleteAccount, addStar, removeStar, getStars, downloadRoadmap, } from "../controllers/userController.js"
import { isAuthenticated } from "../middlewares/auth.js";
import multer from 'multer';

const upload = multer();

const router = express.Router();

router.get("/roadmap/download/:roadmapId", isAuthenticated, downloadRoadmap);

router.post("/register", upload.none(), register);
router.post("/login", login);
router.post("/bookmarks/add", isAuthenticated, addBookmark);
router.delete("/bookmarks/remove", isAuthenticated, removeBookmark);
router.post("/roadmaps/add", isAuthenticated, addStar);
router.delete("/roadmaps/remove", isAuthenticated, removeStar);
router.get("/roadmaps", isAuthenticated, getStars);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
router.delete("/delete", isAuthenticated, deleteAccount);

export default router;