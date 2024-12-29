import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const { city, niche, searchKeyword, page = 1, limit = 4  } = req.query;
  const query = {};

  // Adjust city filtering to work with location array
  if (city) {
    query.location = { $in: [city] };
  }

  if (niche) {
    query.niche = niche;
  }

  if (searchKeyword) {
    query.$or = [
      { title: { $regex: searchKeyword, $options: "i" } },
      { companyName: { $regex: searchKeyword, $options: "i" } },
      { shortDescription: { $regex: searchKeyword, $options: "i" } },
      { lengthyDescription: { $regex: searchKeyword, $options: "i" } }
    ];
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Get total count of matching documents
  const totalJobs = await Job.countDocuments(query);

  // Get paginated results
  const jobs = await Job.find(query)
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    jobs,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalJobs / limit),
    totalJobs,
  });
});

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  res.status(200).json({
    success: true,
    job,
  });
});


export const getAllBookmarkedJobs = catchAsyncErrors(async (req, res, next) => {
  const { id: userId } = req.user; // Get the authenticated user's ID

  // Find the user and populate the bookmarks field
  const user = await User.findById(userId).populate("bookmarks");

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    bookmarkedJobs: user.bookmarks, // This will contain the populated Job objects
  });
});

export const applyForJob = catchAsyncErrors(async (req, res, next) => {
  const { id: jobId } = req.params;
  const userId = req.user._id;

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Check if user has already applied
  const user = await User.findById(userId);
  if (user.appliedJobs.includes(jobId)) {
    return next(new ErrorHandler("You have already applied for this job", 400));
  }

  // Add job to user's applied jobs
  user.appliedJobs.push(jobId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Successfully applied for job"
  });
});

