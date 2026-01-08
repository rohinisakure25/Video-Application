import { Server } from "socket.io";

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    // Map to keep track of which user is in which room
    // Key: Room Path, Value: Array of Socket IDs
    let rooms = {};

    io.on("connection", (socket) => {
        console.log("New User Connected:", socket.id);

        socket.on("join-call", (path) => {
            // 1. Initialize room if it doesn't exist
            if (rooms[path] === undefined) {
                rooms[path] = [];
            }
            
            // 2. Add user to the room list
            rooms[path].push(socket.id);
            socket.join(path); // This is built-in Socket.io room logic

            console.log(`User ${socket.id} joined room: ${path}`);

            // 3. Tell everyone in the room (including the new user) to update their video list
            io.to(path).emit("user-joined", socket.id, rooms[path]);
        });

        // 4. The Handshake (Signaling)
        // This passes the WebRTC "offer/answer" between two specific users
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // 5. Chat Logic
       // src/controllers/socketManager.js

        socket.on("chat-message", (data, sender) => {
        // Get the room the socket is currently in
            const [room] = Array.from(socket.rooms).filter(r => r !== socket.id);
    
            if (room) {
            // Broadcast the data and the sender's name to everyone in that specific room
             socket.to(room).emit("chat-message", data, sender, socket.id);
            }
        });
        // 6. Cleanup when user closes the tab
        socket.on("disconnect", () => {
            console.log("User Disconnected:", socket.id);
            
            for (const path in rooms) {
                let index = rooms[path].indexOf(socket.id);
                if (index !== -1) {
                    rooms[path].splice(index, 1); // Remove from our list
                    io.to(path).emit("user-left", socket.id); // Tell others they left
                }
            }
        });
    });

    return io;
};

export default connectToSocket;