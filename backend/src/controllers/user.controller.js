import { User } from '../models/user.model.js';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import { Meeting } from "../models/meeting.model.js";
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }

        // ✅ Generate a JWT instead of a random hex
        // We embed the username/id so we don't have to look it up later
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "your_secret_key", 
            { expiresIn: "7d" } // Token expires in 7 days
        );

        // We no longer need to save the token to the DB (Stateless Auth)
        return res.status(httpStatus.OK).json({ 
            message: "Login successful", 
            token,
            user: { name: user.name, username: user.username } // Return user info for frontend
        });

    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};
const register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};
export const addToHistory = async (req, res) => {
    const { meeting_code } = req.body;

    try {
        const newMeeting = new Meeting({
            user_id: req.user.id, // Derived from JWT token
            meeting_code: meeting_code
        });

        await newMeeting.save();
        res.status(httpStatus.CREATED).json({ message: "Added to history" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};
export const getUserHistory = async (req, res) => {
    try {
        const history = await Meeting.find({ user_id: req.user.id });
        res.status(httpStatus.OK).json(history);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};
export { login, register };
