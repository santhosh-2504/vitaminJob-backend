import express from "express"
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.js";
import { 
  getAllRoadmaps,
  getAllStarredRoadmaps
} from '../controllers/roadmapController.js';

// Routes
router.get('/roadmap/all', getAllRoadmaps);
router.get("/starred-roadmaps", isAuthenticated, getAllStarredRoadmaps);

export default router;