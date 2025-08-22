import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import authMiddleware from "./middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const app = express();

app.use(clerkMiddleware());

app.listen(process.env.port,() => {
    console.log(`Server is running on port ${process.env.port}`)
})

export default prisma;