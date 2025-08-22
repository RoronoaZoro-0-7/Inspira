import { Request, Response } from 'express';
import prisma from '../index';

// GET /api/chat/conversations - Get user's conversations
export const getConversations = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [
          { participant1Id: req.user.profile!.id },
          { participant2Id: req.user.profile!.id }
        ]
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        participant2: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        lastMessage: {
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform conversations to show the other participant
    const transformedConversations = conversations.map(conversation => {
      const isParticipant1 = conversation.participant1Id === req.user.profile!.id;
      const otherParticipant = isParticipant1 ? conversation.participant2 : conversation.participant1;
      
      return {
        id: conversation.id,
        otherParticipant,
        lastMessage: conversation.lastMessage,
        messageCount: conversation._count.messages,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt
      };
    });

    res.json({
      success: true,
      data: transformedConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get conversations" 
    });
  }
};

// GET /api/chat/conversations/:conversationId/messages - Get messages in a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { conversationId } = req.params;
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Verify user is part of this conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: req.user.profile!.id },
          { participant2Id: req.user.profile!.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Conversation not found or access denied" 
      });
    }

    const [messages, total] = await prisma.$transaction([
      prisma.chatMessage.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.chatMessage.count({
        where: { conversationId }
      })
    ]);

    // Mark messages as read if they're from the other participant
    const unreadMessages = messages.filter(
      msg => msg.senderId !== req.user.profile!.id && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await prisma.chatMessage.updateMany({
        where: {
          id: { in: unreadMessages.map(msg => msg.id) }
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get messages" 
    });
  }
};

// POST /api/chat/conversations/:conversationId/messages - Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { conversationId } = req.params;
    const { content, messageType = 'TEXT', fileUrl } = req.body;

    if (!content) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Message content is required" 
      });
    }

    // Verify user is part of this conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: req.user.profile!.id },
          { participant2Id: req.user.profile!.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Conversation not found or access denied" 
      });
    }

    // Create message and update conversation
    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.chatMessage.create({
        data: {
          conversationId,
          senderId: req.user.profile!.id,
          content,
          messageType,
          fileUrl
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          }
        }
      });

      // Update conversation's last message and updatedAt
      await tx.chatConversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: message.id,
          updatedAt: new Date()
        }
      });

      return message;
    });

    // Notify other participants via WebSocket
    const chatWebSocket = (global as any).chatWebSocket;
    if (chatWebSocket) {
      await chatWebSocket.notifyNewMessage(result);
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to send message" 
    });
  }
};

// POST /api/chat/conversations - Create or get conversation with another user
export const createConversation = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Participant ID is required" 
      });
    }

    if (participantId === req.user.profile!.id) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Cannot create conversation with yourself" 
      });
    }

    // Check if conversation already exists
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: req.user.profile!.id,
            participant2Id: participantId
          },
          {
            participant1Id: participantId,
            participant2Id: req.user.profile!.id
          }
        ]
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        participant2: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        lastMessage: {
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      }
    });

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          participant1Id: req.user.profile!.id,
          participant2Id: participantId
        },
        include: {
          participant1: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          },
          participant2: {
            select: {
              id: true,
              name: true,
              imageUrl: true
            }
          },
          lastMessage: {
            select: {
              content: true,
              createdAt: true,
              senderId: true
            }
          }
        }
      });
    }

    // Transform to show the other participant
    const isParticipant1 = conversation!.participant1Id === req.user.profile!.id;
    const otherParticipant = isParticipant1 ? conversation!.participant2 : conversation!.participant1;

    res.json({
      success: true,
      data: {
        id: conversation!.id,
        otherParticipant,
        lastMessage: conversation!.lastMessage,
        createdAt: conversation!.createdAt,
        updatedAt: conversation!.updatedAt
      }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to create conversation" 
    });
  }
};

// GET /api/chat/users - Search users to start conversations with
export const searchUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { q = '', page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      id: { not: req.user.profile!.id } // Exclude current user
    };

    if (q) {
      where.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { user: { email: { contains: q as string, mode: 'insensitive' } } }
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.profile.findMany({
        where,
        select: {
          id: true,
          name: true,
          imageUrl: true,
          bio: true,
          user: {
            select: {
              email: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { name: 'asc' }
      }),
      prisma.profile.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to search users" 
    });
  }
};

// PATCH /api/chat/messages/:messageId/read - Mark message as read
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { messageId } = req.params;

    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        conversation: {
          OR: [
            { participant1Id: req.user.profile!.id },
            { participant2Id: req.user.profile!.id }
          ]
        }
      }
    });

    if (!message) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Message not found or access denied" 
      });
    }

    if (message.senderId === req.user.profile!.id) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Cannot mark your own message as read" 
      });
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to mark message as read" 
    });
  }
};
