import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken"

export const isAuthenticated = catchAsyncErrors(async(req, res, next) => {
    const {token} = req.cookies;
    
    // For /getuser route, return success: false without error if no token
    if (req.path === '/getuser' && !token) {
        return res.status(200).json({
            success: false,
            isAuthenticated: false
        });
    }
    
    if(!token){
        return next(new ErrorHandler("User not authenticated", 400));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        // For /getuser route, handle expired tokens gracefully
        if (req.path === '/getuser') {
            return res.status(200).json({
                success: false,
                isAuthenticated: false
            });
        }
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});