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

    if (!profile) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User profile not found" 
      });
    }

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

    if (!profile) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User profile not found" 
      });
    }
  
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

    if (!profile) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User profile not found" 
      });
    }

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
        // Get current credits to ensure proper increment
        const currentProfile = await prisma.profile.findUnique({
          where: { id: commentAuthor.authorId },
          select: { credits: true }
        });
        
        if (currentProfile) {
          await prisma.profile.update({
            where: { id: commentAuthor.authorId },
            data: { credits: currentProfile.credits + 5 }
          });
        }
      }

      // Get updated upvote count
      const upvoteCount = await prisma.commentUpvote.count({
        where: { commentId }
      });

      res.json({
        success: true,
        data: { upvotes: upvoteCount }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Already upvoted, remove the upvote
        await prisma.commentUpvote.delete({
          where: {
            commentId_userId: {
              commentId,
              userId: profile.id
            }
          }
        });

        // Decrement the comment author's credits by 5 (remove the credits that were given)
        const commentAuthor = await prisma.comment.findUnique({
          where: { id: commentId },
          select: { authorId: true }
        });
        if (commentAuthor && commentAuthor.authorId) {
          // Get current credits to prevent going below 0
          const currentProfile = await prisma.profile.findUnique({
            where: { id: commentAuthor.authorId },
            select: { credits: true }
          });
          
          if (currentProfile) {
            const newCredits = Math.max(0, currentProfile.credits - 5);
            await prisma.profile.update({
              where: { id: commentAuthor.authorId },
              data: { credits: newCredits }
            });
          }
        }

        // Get updated upvote count
        const upvoteCount = await prisma.commentUpvote.count({
          where: { commentId }
        });

        res.json({
          success: true,
          data: { upvotes: upvoteCount }
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

// GET /posts/:id/comments - Get all comments for a post
export const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;

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

    // Get all top-level comments (no parent) for the post
    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        parentId: null // Only top-level comments
      },
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
        _count: {
          select: {
            upvotes: true,
            replies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments by post ID error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get comments" 
    });
  }
};
