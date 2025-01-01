import mongoose from 'mongoose';
import { Quiz } from '../models/quizSchema.js';


const migrateQuizzes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database');

        const quizzes = await Quiz.find({});
        console.log(`Found ${quizzes.length} quizzes to migrate`);
        
        for (const quiz of quizzes) {
            // Add _id to questions that don't have one
            quiz.questions = quiz.questions.map(question => ({
                ...question.toObject(),
                _id: question._id || new mongoose.Types.ObjectId()
            }));
            
            await quiz.save();
            console.log(`Migrated quiz: ${quiz.title}`);
        }
        
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateQuizzes();