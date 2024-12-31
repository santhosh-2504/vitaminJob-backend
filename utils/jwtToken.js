export const sendToken = (user, statusCode, res, message) => {
    const token = user.getJWTToken();
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
        sameSite: "strict",  // Protect against CSRF
        path: "/",
    };
    
    res.status(statusCode)
       .cookie("token", token, options)
       .json({
            success: true,
            user,
            message,
            // Remove token from JSON response
       });
};