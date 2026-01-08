import express from 'express';
import mongoose from 'mongoose';
import {createServer} from "node:http";
import {Server} from "socket.io";
import userRoutes from './routes/users.routes.js';
import cors from 'cors';
const app = express();
const server = createServer(app);
const io = connectToSocket(server);
import connectToSocket from './controllers/socketManager.js';
app.set("port", process.env.PORT || 8000)
// app.get('/home', (req, res) => {
//     return res.json({"hello": "world"});
// });
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use('/api/v1/users', userRoutes);
app.use(express.urlencoded({ limit : "40kb", extended: true }));
const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://rsakure5_db_user:Ice5RPF2PwcvYmTl@vc.dtswtum.mongodb.net/?appName=VC&retryWrites=true&w=majority");
    console.log(`Connected to MongoDB Host: ${connectionDb.connection.host}`);
    server.listen(app.get("port"),() => {
        console.log("listening on port 8000");
    });
}
start();