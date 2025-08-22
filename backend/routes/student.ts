import express,{Request,Response} from "express";
import prisma from '../index';
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.send("Student route");
});

router.get("/profile/:id", async (req: Request, res: Response) => {
    const userId = req.params.id;
    const currUser = prisma.user.findUnique({
        where: { id: userId }
    });

});
router.post("/profile/posts",async (req:Request,res:Response)=>{
   const userId = req.params.id;
    const posts = await prisma.post.findUnique({
         where: { userId: userId },
         include: { comments: true},
         orderBy: { createdAt: 'desc' }
    });   

   res.json(posts);
});

export default router;
