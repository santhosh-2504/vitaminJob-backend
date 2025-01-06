import { govtJob } from "../models/govtJobSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";

export const getAllGovtJobs = catchAsyncErrors(async (req, res, next) => {
    const { searchKeyword, page = 1, limit = 4  } = req.query;
    const query = {};

  
    if (searchKeyword) {
      query.$or = [
        { title: { $regex: searchKeyword, $options: "i" } },
        { description: { $regex: searchKeyword, $options: "i" } },
        { qualification: { $regex: searchKeyword, $options: "i" } },
      ];
    }
  
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
  
    // Get total count of matching documents
    const totalJobs = await govtJob.countDocuments(query);
  
    // Get paginated results
    const jobs = await govtJob.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({_id : -1});
  
    res.status(200).json({
      success: true,
      jobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    });
  });

  
  export const getASingleGovtJob = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const job = await govtJob.findById(id);
  
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
  
    res.status(200).json({
      success: true,
      job,
    });
  });
  
  