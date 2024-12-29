import {Quiz} from "../models/quizSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

export const getAllQuizzes = catchAsyncErrors(async(req, res , next) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page -1) * limit;

        let query = {};

        if(req.query.niche && req.query.niche !== 'All'){
            query.niche = req.query.niche;
        }
        if(req.query.keyword){
            query.$or = [
                {title : {$regex: req.query.keyword, $options: 'i'}},
                { description: { $regex: req.query.keyword, $options: 'i' }}
            ];
        }
        const totalQuizzes = await Quiz.countDocuments(query);
        const quizzes = await Quiz.find(query)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)

        const totalPages = Math.ceil(totalQuizzes/limit);
        res.status(200).json({
            success : true,
            quizzes,
            currentPage : page,
            totalPages,
            totalQuizzes,
            message: 'Quizzes fetched successfully'
        })
    } catch(error){
        return next(new ErrorHandler(error.message, 500));
    }
})

export const getSingleQuiz = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const quiz = await Quiz.findById(id);
    if(!quiz){
        return next(new ErrorHandler("Quiz Not Found", 400));
    }

    res.status(200).json({
        success :true,
        quiz,
    })
})

export const startQuiz = catchAsyncErrors(async (req, res, next) => {
    try {
        
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            
            return next(new ErrorHandler("Quiz not found", 404));
        }

        
        
        // Send complete quiz data including correct answers
        const quizData = {
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions.map(q => {
                
                return {
                    _id: q._id,
                    questionText: q.questionText,
                    options: q.options,
                    correctOption: q.correctOption
                };
            }),
            totalQuestions: quiz.questions.length
        };

        

        res.status(200).json({
            success: true,
            quiz: quizData
        });
    } catch (error) {
        
        return next(new ErrorHandler(error.message, 500));
    }
});

/*export const submitQuiz = catchAsyncErrors(async (req, res, next) => {
    try {
        const { answers, timeTaken } = req.body;
        const quizId = req.params.id;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return next(new ErrorHandler("Quiz not Found", 400));
        }

        // Calculate score
        let score = 0;
        const processedAnswers = [];

        for (const answer of answers) {
            const question = quiz.questions.find(q => 
                q._id.toString() === answer.questionId.toString()
            );

            if (!question) {
                console.error('Question not found:', answer.questionId);
                continue;
            }

            const selectedOption = Number(answer.selectedOption);
            const correctOption = Number(question.correctOption);
            const isCorrect = selectedOption === correctOption;

            if (isCorrect) {
                score++;
            }

            processedAnswers.push({
                questionId: answer.questionId,
                selectedOption,
                isCorrect
            });
        }

        // Create quiz result
        const result = await QuizResult.create({
            quiz: quiz._id,
            user: req.user._id,
            score,
            totalQuestions: quiz.questions.length,
            timeTaken,
            answers: processedAnswers
        });

        // Send response with detailed results
        res.status(200).json({
            success: true,
            result: {
                score,
                totalQuestions: quiz.questions.length,
                timeTaken,
                answers: processedAnswers,
                details: processedAnswers.map(answer => {
                    const question = quiz.questions.find(q => 
                        q._id.toString() === answer.questionId.toString()
                    );
                    return {
                        question: question.questionText,
                        selectedOption: question.options[answer.selectedOption],
                        correctOption: question.options[question.correctOption],
                        isCorrect: answer.isCorrect
                    };
                })
            },
        });
    } catch (error) {
        console.error('Submit Quiz Error:', error);
        return next(new ErrorHandler(error.message, 500));
    }
});*/

export const testLogging = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Test successful'
    });
};