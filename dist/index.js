"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config(); // Load environment variables from .env file
// Initialize Express app and HTTP server
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/auth', auth_1.default);
// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    // Join a room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
    });
    // Handle message sending
    socket.on('sendMessage', (message, room) => {
        io.to(room).emit('receiveMessage', message);
        console.log(`Message from ${socket.id} in room ${room}: ${message}`);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
