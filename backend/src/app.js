import express from 'express';
import mongoose from 'mongoose';
import { createServer } from "node:http";
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.routes.js';
import connectToSocket from './controllers/socketManager.js';

// 1. Initialize Configuration
dotenv.config();
const app = express();
const server = createServer(app);

// 2. Socket.io Setup
// Note: Ensure connectToSocket is called after server initialization
const io = connectToSocket(server);

// 3. Middlewares
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// 4. Routes
app.use('/api/v1/users', userRoutes);

// 5. Global Error Handler (Crucial for Resume)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// 6. Database and Server Start
const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${connectionDb.connection.host}`);
        
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1); // Exit process with failure
    }
}

start();