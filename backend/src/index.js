import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';

import authRoutes from "./routes/auth.route.js";
import messageRoutes from './routes/message.route.js'

import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";


dotenv.config();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectDB(); // Wait for DB to connect
        server.listen(PORT, () => {
            console.log("Application started on Port: " + PORT);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1); // Exit process if DB fails to connect
    }
};

startServer();