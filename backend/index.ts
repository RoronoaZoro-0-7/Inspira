import express from "express";
import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
export default prisma;
app.listen(3000, () => {
    console.log("Server is running on port 3000")
})