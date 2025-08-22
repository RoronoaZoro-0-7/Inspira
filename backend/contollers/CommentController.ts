import { Request, Response } from 'express';
import prisma from '../index';

// POST /posts/:id/comments - Add comment to a post
export const addComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Content is required" 
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Post not found" 
      });
    }

    const profile = await prisma.profile.findUnique({
      where:{
        userId: req.user.clerkId
      }
    })

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: profile.id
      }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to add comment" 
    });
  }
};

// POST /comments/:id/replies - Add nested reply to a comment
export const addReply = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { id: commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Content is required" 
      });
    }

    const profile = await prisma.profile.findUnique({
      where:{
        userId: req.user.clerkId
      }
    });
  
    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!parentComment) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Parent comment not found" 
      });
    }

    // Create reply
    const reply = await prisma.comment.create({
      data: {
        content,
        postId: parentComment.postId,
        authorId: profile.id,
        parentId: commentId
      },
      include: {
        parent: {
          select: {
            content: true
          }
        },
        post: {
          select: {
            title: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to add reply" 
    });
  }
};

// POST /comments/:id/upvote - Upvote a comment
export const upvoteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { id: commentId } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Comment not found" 
      });
    }
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });
    // Try to create upvote (will fail if already exists due to unique constraint)
    try {
      const upvote = await prisma.commentUpvote.create({
        data: {
          commentId,
          userId: profile.id
        }
      });

      // Increment the comment author's credits by 5
      const commentAuthor = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true }
      });
      if (commentAuthor && commentAuthor.authorId) {
        await prisma.profile.update({
          where: { id: commentAuthor.authorId },
          data: { credits: { increment: 5 } }
        });
      }

      res.json({
        success: true,
        data: upvote
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Already upvoted, remove the upvote
        await prisma.commentUpvote.delete({
          where: {
            commentId_userId: {
              commentId,
              userId: req.user.profile!.id
            }
          }
        });

        res.json({
          success: true,
          data: { removed: true }
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Upvote comment error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to upvote comment" 
    });
  }
};

// GET /comments/:id - Get comment with replies
export const getComment = async (req: Request, res: Response) => {
  try {
    const { id: commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            name: true,
            imageUrl: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                name: true,
                imageUrl: true
              }
            },
            _count: {
              select: {
                upvotes: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            upvotes: true,
            replies: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Comment not found" 
      });
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get comment" 
    });
  }
};
