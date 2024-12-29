import express from "express"
const router = express.Router()
import { getAllCourses } from '../controllers/courseController.js';

//Roues
router.get('/course/all', getAllCourses);

export default router;