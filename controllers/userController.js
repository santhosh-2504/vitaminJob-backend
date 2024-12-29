import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import { Roadmap } from "../models/roadmapSchema.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return next(new ErrorHandler("All Fields are Required", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already exists"
      });
    }
    
    const user = await User.create({
      name,
      email,
      phone,
      password,
      address: req.body.address || "",
      firstNiche: req.body.firstNiche || "",
      secondNiche: req.body.secondNiche || "",
      thirdNiche: req.body.thirdNiche || "",
    });

    sendToken(user, 201, res, "User Registered");
  } catch (error) {
    next(error);
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or Password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Username or Password", 400));
  }

  sendToken(user, 200, res, "User Logged in Successfully");
});

/**
 * Add Job to Bookmarks
 */
export const addBookmark = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.query; // Extract jobId from query parameters

  if (!jobId) {
    return next(new ErrorHandler("Job ID is required", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if the job is already bookmarked
  if (user.bookmarks.includes(jobId)) {
    return next(new ErrorHandler("Job is already bookmarked", 400));
  }

  // Add the jobId to the bookmarks array
  user.bookmarks.push(jobId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Bookmark added successfully",
  });
});

/**
 * Remove Job from Bookmarks
 */
export const removeBookmark = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.query; // Extract jobId from query parameters

  if (!jobId) {
    return next(new ErrorHandler("Job ID is required", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Remove the jobId from the bookmarks array
  user.bookmarks = user.bookmarks.filter((id) => id.toString() !== jobId);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Bookmark removed successfully",
  });
});

/**
 * Get All Bookmarked Jobs
 */
export const getBookmarks = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("bookmarks");

  if (!user || !user.bookmarks) {
    return next(new ErrorHandler("No bookmarks found", 404));
  }

  res.status(200).json({
    success: true,
    bookmarks: user.bookmarks,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  console.log("Full Request Body:", req.body);

  const { name, email, phone, address, firstNiche, secondNiche, thirdNiche } = req.body;

  console.log("Received Niches:", { firstNiche, secondNiche, thirdNiche });

  const newUserData = {
    name,
    email,
    phone,
    address,
    firstNiche,
    secondNiche,
    thirdNiche,
  };

  const currentUser = await User.findById(req.user.id);
  console.log("Current User Data:", currentUser);

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  console.log("Updated User Data:", user);

  res.status(200).json({
    success: true,
    user,
    message: "Profile Updated Successfully",
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is Incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("New Password and Confirmed Password do not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res, "Password Updated Successfully");
});

export const deleteAccount = catchAsyncErrors(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect password", 401));
  }

  await User.findByIdAndDelete(req.user.id);

  res.status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Account deleted successfully",
    });
});

export const addStar = catchAsyncErrors(async (req, res, next) => {
  const { roadmapId } = req.query; // Extract roadmapId from query parameters

  if (!roadmapId) {
    return next(new ErrorHandler("Roadmap ID is required", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.roadmaps.includes(roadmapId)) {
    return next(new ErrorHandler("Roadmap is already bookmarked", 400));
  }

  user.roadmaps.push(roadmapId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Roadmap added successfully",
  });
});

/**
 * Remove roadmap from Bookmarks
 */
export const removeStar = catchAsyncErrors(async (req, res, next) => {
  const { roadmapId } = req.query; // Extract roadmapId from query parameters

  if (!roadmapId) {
    return next(new ErrorHandler("Roadmap ID is required", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.roadmaps = user.roadmaps.filter((id) => id.toString() !== roadmapId);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Roadmap removed successfully",
  });
});

/**
 * Get All Starred Roadmaps Jobs
 */
export const getStars = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("roadmaps");

  if (!user || !user.roadmaps) {
    return next(new ErrorHandler("No roadmaps found", 404));
  }

  res.status(200).json({
    success: true,
    roadmaps: user.roadmaps,
  });
});


export const downloadRoadmap = catchAsyncErrors(async (req, res, next) => {
    try {
      const { roadmapId } = req.params;
      const roadmap = await Roadmap.findById(roadmapId);
  
      if (!roadmap) {
        return next(new ErrorHandler("Roadmap not found", 404));
      }
  
      // Convert Google Drive sharing URL to direct download URL
      let directUrl = roadmap.url;
      if (directUrl.includes('drive.google.com')) {
        const fileId = directUrl.match(/\/d\/(.*?)\/|id=(.*?)&/)?.[1];
        if (fileId) {
          directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }
  
      roadmap.downloadCount += 1;
      await roadmap.save();
  
      res.status(200).json({
        success: true,
        url: directUrl
      });
    } catch (error) {
      console.error('Download error:', error);
      return next(new ErrorHandler("Error processing download", 500));
    }
  });
  