import express from "express";
import { 
    getAllJobs, 
    getASingleJob, 
    getAllBookmarkedJobs,
    applyForJob
} from "../controllers/jobController.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.get("/getall", getAllJobs);
router.get("/get/:id", getASingleJob);
router.get("/bookmarked-jobs", isAuthenticated, getAllBookmarkedJobs);
router.post("/apply/:id",  applyForJob);


export default router;