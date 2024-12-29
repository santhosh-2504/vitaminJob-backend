import {config} from 'dotenv' 
config({path: "./config/config.env"})
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import {connection} from "./database/connection.js"
import { errorMiddleware } from './middlewares/error.js'
import userRouter from "./routes/userRouter.js"
import jobRouter from "./routes/jobRouter.js"
import roadmapRouter from "./routes/roadmapRouter.js"
import courseRouter from "./routes/courseRouter.js"
import quizRouter from './routes/quizRouter.js'
import { createOrder, verifyPayment } from './controllers/paymentController.js';
//import postRouter from './routes/postRouter.js'
//import { newsLetterCron } from './automation/newsLetterCron.js';
const app = express()


app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true,
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/roadmap",roadmapRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/quiz", quizRouter);
//app.use("/api/v1/post", postRouter);

// Add these routes with your existing routes
app.post('/api/payment/create-order', createOrder);
app.post('/api/payment/verify', verifyPayment);
//newsLetterCron()
connection();
app.use(errorMiddleware)
export default app;