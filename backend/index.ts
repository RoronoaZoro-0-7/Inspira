import express from "express";
import dotenv from "dotenv";
import {PrismaClient} from "@prisma/client";

dotenv.config();

const app = express();
const prisma=new PrismaClient();
export default prisma;

app.listen(process.env.port,() => {
    console.log(`Server is running on port ${process.env.port}`)
})