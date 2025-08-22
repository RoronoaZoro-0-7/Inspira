import { NextFunction, Request, Response } from "express";
import { getAuth, User } from "@clerk/express";
import prisma from "../index";

interface RequestWithUser extends Request {
    user: User;
}

const authMiddleware = async function(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {

    const user = getAuth(req as any);

    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const clerkId = user.userId;

    const dbUser = await prisma.user.findUnique({
        where: {
            clerkId: clerkId
        }
    });

    if (!dbUser) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    req.user = dbUser as User;

    next();
}

export default authMiddleware;