import { Course } from "../models/courseSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
//import { User } from "../models/userSchema";

export const getAllCourses = catchAsyncErrors(async(req, res, next)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        let query = {};

        if(req.query.niche && req.query.niche !== 'All'){
            query.niche = req.query.niche;
        }
        if(req.query.keyword){
            query.$or = [
                { title: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } }
            ];
        }
        const totalCourses = await Course.countDocuments(query);
        const courses = await Course.find(query)
        .skip(skip)
        .limit(limit)
        .sort({_id : -1})
        //.select('title description niche createdAt');

        const totalPages = Math.ceil(totalCourses/limit);

        res.status(200).json({
            success : true,
            courses,
            currentPage : page,
            totalPages,
            totalCourses,
            message : 'Courses fetched successfully'
        });
    } catch (error){
        return next(new ErrorHandler(error.message, 500));
    }
})