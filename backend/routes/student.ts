import express,{Request,Response} from "express";
import prisma from '../index';
import authMiddleware from "../middlewares/authMiddleware";
const router = express.Router();


router.get("/", (req: Request, res: Response) => {
    res.send("Student route");
});

router.get("/profile/",authMiddleware ,async (req: Request, res: Response) => {
    if(!req.user){
        return res.status(401).json({ error: "Unauthorized" });
    }
    try{
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }

});
router.post("/profile/posts",authMiddleware ,async (req: Request, res: Response) => {
    if(!req.user){
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.profile) {
        return res.status(400).json({ error: "User profile not found" });
    }

    const { title, content, categoryIds, imageUrls, videoUrls } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try{
        const post = await prisma.post.create({
            data: {
                authorId: req.user.profile.id,
                title,
                content: content ,
                categoryIds: categoryIds || [],
                imageUrls: imageUrls || [],
                videoUrls: videoUrls || [],
                helpfulCommentIds: []
            },
            include: {
                author: true,
                categories: true,
                comments: true,
                upvotes: true,
                _count: {
                    select: {
                        comments: true,
                        upvotes: true
                    }
                }
            }
        });
        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.put("/profile/posts/:postId", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.profile) {
        return res.status(400).json({ error: "User profile not found" });
    }

    const { title, content, categoryIds, imageUrls, videoUrls } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        // First check if the post exists and belongs to the user
        const existingPost = await prisma.post.findFirst({
            where: { 
                id: req.params.postId,
                authorId: req.user.profile.id
            }
        });

        if (!existingPost) {
            return res.status(404).json({ error: "Post not found or you don't have permission to edit it" });
        }

        const post = await prisma.post.update({
            where: { id: req.params.postId },
            data: {
                title,
                content,
                categoryIds: categoryIds || [],
                imageUrls: imageUrls || [],
                videoUrls: videoUrls || [],
            },
            include: {
                author: true,
                categories: true,
                comments: true,
                upvotes: true,
                _count: {
                    select: {
                        comments: true,
                        upvotes: true
                    }
                }
            }
        });
        res.status(200).json(post);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/profile/posts/:postId", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.profile) {
        return res.status(400).json({ error: "User profile not found" });
    }

    try {
        // First check if the post exists and belongs to the user
        const existingPost = await prisma.post.findFirst({
            where: { 
                id: req.params.postId,
                authorId: req.user.profile.id
            }
        });

        if (!existingPost) {
            return res.status(404).json({ error: "Post not found or you don't have permission to delete it" });
        }

        const post = await prisma.post.delete({
            where: { id: req.params.postId }
        });
        res.status(200).json({ message: "Post deleted successfully", post });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/profile/posts/", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.profile) {
        return res.status(400).json({ error: "User profile not found" });
    }

    try {
        const posts = await prisma.post.findMany({
            where: { authorId: req.user.profile.id },
            include: {
                author: true,
                categories: true,
                comments: true,
                upvotes: true,
                _count: {
                    select: {
                        comments: true,
                        upvotes: true
                    }
                }
            }
        });
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/profile/posts/:postId", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.postId },
            include: {
                author: true,
                categories: true,
                comments: true,
                upvotes: true,
                _count: {
                    select: {
                        comments: true,
                        upvotes: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/categories", authMiddleware, async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get('/leaderboard', authMiddleware, async (req: Request, res: Response) => {
    try {
        const leaderboard = await prisma.profile.findMany({
            include: {
                user: true
            },
            orderBy: {
                credits: 'desc'
            },
            take: 10
        });
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/profile/posts/", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.profile) {
        return res.status(400).json({ error: "User profile not found" });
    }

    const { title, content, categoryIds, imageUrls, videoUrls } = req.body;

    try {
        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId: req.user.profile.id,
                categoryIds: categoryIds || [],
                imageUrls: imageUrls || [],
                videoUrls: videoUrls || []
            }
        });
        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
