import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';

export const verifyToken = (req, res, next) => {
    try {
        // Get the token from the "Authorization" header
        const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token, authorization denied" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        // Attach the user info to the request object so the next function can use it
        req.user = decoded;

        // "next()" tells Express to move to the actual controller function
        next();
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Token is not valid" });
    }
};