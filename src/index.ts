import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';

dotenv.config();  
const app: Application = express();
const server: HTTPServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(server);


app.use(express.json());
app.use(cookieParser());


app.use('/auth', authRoutes);


io.on('connection', (socket: Socket) => {
    console.log('New client connected', socket.id);


    socket.on('joinRoom', (room: string) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
    });

   
    socket.on('sendMessage', (message: string, room: string) => {
        io.to(room).emit('receiveMessage', message);
        console.log(`Message from ${socket.id} in room ${room}: ${message}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
