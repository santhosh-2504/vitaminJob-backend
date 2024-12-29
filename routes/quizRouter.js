import express from "express"

import {getAllQuizzes, getSingleQuiz, startQuiz} from '../controllers/quizController.js'
import { isAuthenticated } from "../middlewares/auth.js"
const router = express.Router()

router.get('/quizzes/all', getAllQuizzes)
router.get('/get/:id', getSingleQuiz);
router.get('/:id/start', isAuthenticated, startQuiz);
//router.post('/:id/submit', isAuthenticated, submitQuiz);

export default router;