// controllers/roadmapController.js
import {Roadmap} from "../models/roadmapSchema.js"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";

// Get all roadmaps with pagination, search, and filters
export const getAllRoadmaps = catchAsyncErrors(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8; // roadmaps per page
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Add niche filter if provided
    if (req.query.niche && req.query.niche !== 'All') {
      query.niche = req.query.niche;
    }

    // Add keyword search if provided
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const totalRoadmaps = await Roadmap.countDocuments(query);
    const roadmaps = await Roadmap.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title description niche createdAt'); // Select only needed fields

    // Calculate total pages
    const totalPages = Math.ceil(totalRoadmaps / limit);

    res.status(200).json({
      success: true,
      roadmaps,
      currentPage: page,
      totalPages,
      totalRoadmaps,
      message: 'Roadmaps fetched successfully'
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getAllStarredRoadmaps = catchAsyncErrors(async (req, res, next) => {
  const { id: userId } = req.user; // Get the authenticated user's ID

  // Find the user and populate the roadmaps field
  const user = await User.findById(userId).populate("roadmaps");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    starredRoadmaps: user.roadmaps, // This will contain the populated Job objects
  });
});