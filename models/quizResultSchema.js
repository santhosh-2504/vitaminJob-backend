import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, 
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        selectedOption: {
            type: String,
            required: true
        }
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

export const QuizResult = mongoose.model("QuizResult", quizResultSchema);