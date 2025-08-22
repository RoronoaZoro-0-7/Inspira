import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getAuth } from '@clerk/express';
import prisma from '../index';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  fileUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface WebSocketMessage {
  type: 'message' | 'typing' | 'read' | 'join' | 'leave';
  data: any;
}

class ChatWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  private userConversations: Map<string, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      try {
        // Extract token from query string or headers
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

        let profileId: string | null = null;
        let isAuthenticated = false;

        // Try to authenticate if token is provided
        if (token) {
          try {
            const { userId } = await this.verifyToken(token);
            if (userId) {
              const user = await prisma.user.findUnique({
                where: { clerkId: userId },
                include: { profile: true }
              });

              if (user?.profile) {
                profileId = user.profile.id;
                isAuthenticated = true;
                console.log(`Authenticated user ${profileId} connected to WebSocket`);
              } else {
                console.log(`Token provided but user profile not found`);
                ws.close(1008, 'User profile not found');
                return;
              }
            } else {
              console.log(`Invalid token provided`);
              ws.close(1008, 'Invalid token');
              return;
            }
          } catch (error) {
            console.log(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            ws.close(1008, 'Token verification failed');
            return;
          }
        } else {
          // No token provided - use test user for development/testing
          profileId = 'test-user-' + Date.now();
          isAuthenticated = false;
          console.log(`No token provided, using test user ${profileId}`);
        }

        this.clients.set(profileId, ws);
        this.userConversations.set(profileId, new Set());

        console.log(`User ${profileId} connected to WebSocket (${isAuthenticated ? 'authenticated' : 'test user'})`);

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'welcome',
          data: { 
            message: 'Connected to chat server',
            userId: profileId,
            isAuthenticated: isAuthenticated,
            timestamp: new Date().toISOString()
          }
        }));

        // Send user's active conversations (if authenticated)
        if (isAuthenticated) {
          try {
            const conversations = await this.getUserConversations(profileId);
            ws.send(JSON.stringify({
              type: 'conversations',
              data: conversations
            }));
          } catch (error) {
            console.error('Error fetching conversations:', error);
            ws.send(JSON.stringify({
              type: 'conversations',
              data: []
            }));
          }
        } else {
          // For test users, send empty conversations
          ws.send(JSON.stringify({
            type: 'conversations',
            data: []
          }));
        }

        ws.on('message', async (data: Buffer) => {
          try {
            const message: WebSocketMessage = JSON.parse(data.toString());
            console.log(`Received message from ${profileId}:`, message);
            await this.handleMessage(profileId, message, isAuthenticated);
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Invalid message format' }
            }));
          }
        });

        ws.on('close', () => {
          this.clients.delete(profileId);
          this.userConversations.delete(profileId);
          console.log(`User ${profileId} disconnected from WebSocket`);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${profileId}:`, error);
          this.clients.delete(profileId);
          this.userConversations.delete(profileId);
        });

      } catch (error) {
        console.error('Error setting up WebSocket connection:', error);
        ws.close(1011, 'Internal server error');
      }
    });
  }

  private async verifyToken(token: string) {
    try {
      // This is a simplified token verification
      // In production, you should use Clerk's proper token verification
      const { userId } = getAuth({ headers: { authorization: `Bearer ${token}` } } as any);
      return { userId };
    } catch (error) {
      console.error('Token verification error:', error);
      return { userId: null };
    }
  }

  private async getUserConversations(profileId: string) {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [
          { participant1Id: profileId },
          { participant2Id: profileId }
        ]
      },
      include: {
        participant1: {
          select: { id: true, name: true, imageUrl: true }
        },
        participant2: {
          select: { id: true, name: true, imageUrl: true }
        },
        lastMessage: {
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

  return conversations.map((conversation: any) => {
      const isParticipant1 = conversation.participant1Id === profileId;
      const otherParticipant = isParticipant1 ? conversation.participant2 : conversation.participant1;
      
      return {
        id: conversation.id,
        otherParticipant,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt
      };
    });
  }

  private async handleMessage(profileId: string, message: WebSocketMessage, isAuthenticated: boolean) {
    console.log(`Handling message from ${profileId} (${isAuthenticated ? 'authenticated' : 'test user'}):`, message);
    
    // For test users, just log the message and send a confirmation
    if (!isAuthenticated) {
      console.log(`Test user ${profileId} sent message:`, message);
      
      // Send confirmation back to test user
      const ws = this.clients.get(profileId);
      if (ws) {
        ws.send(JSON.stringify({
          type: 'message_received',
          data: {
            originalMessage: message,
            timestamp: new Date().toISOString(),
            status: 'processed',
            note: 'Test user - message logged only'
          }
        }));
      }
      return;
    }

    // For authenticated users, process normally
    switch (message.type) {
      case 'join':
        await this.handleJoinConversation(profileId, message.data.conversationId);
        break;
      case 'leave':
        await this.handleLeaveConversation(profileId, message.data.conversationId);
        break;
      case 'typing':
        await this.handleTyping(profileId, message.data);
        break;
      case 'read':
        await this.handleMarkAsRead(profileId, message.data);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handleJoinConversation(profileId: string, conversationId: string) {
    // Verify user is part of this conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: profileId },
          { participant2Id: profileId }
        ]
      }
    });

    if (conversation) {
      const userConversations = this.userConversations.get(profileId);
      if (userConversations) {
        userConversations.add(conversationId);
      }
      console.log(`User ${profileId} joined conversation ${conversationId}`);
    } else {
      console.log(`User ${profileId} attempted to join non-existent conversation ${conversationId}`);
    }
  }

  private async handleLeaveConversation(profileId: string, conversationId: string) {
    const userConversations = this.userConversations.get(profileId);
    if (userConversations) {
      userConversations.delete(conversationId);
    }
    console.log(`User ${profileId} left conversation ${conversationId}`);
  }

  private async handleTyping(profileId: string, data: { conversationId: string; isTyping: boolean }) {
    // Send typing indicator to other participants
    this.broadcastToConversation(data.conversationId, profileId, {
      type: 'typing',
      data: {
        userId: profileId,
        conversationId: data.conversationId,
        isTyping: data.isTyping
      }
    });
  }

  private async handleMarkAsRead(profileId: string, data: { messageId: string }) {
    // Mark message as read in database
    await prisma.chatMessage.update({
      where: { id: data.messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    // Notify sender that message was read
    const message = await prisma.chatMessage.findUnique({
      where: { id: data.messageId },
      include: { conversation: true }
    });

    if (message && message.senderId !== profileId) {
      const senderWs = this.clients.get(message.senderId);
      if (senderWs) {
        senderWs.send(JSON.stringify({
          type: 'message_read',
          data: { messageId: data.messageId }
        }));
      }
    }
  }

  // Broadcast message to all participants in a conversation
  public broadcastToConversation(conversationId: string, excludeUserId: string, message: any) {
    this.clients.forEach((ws, profileId) => {
      if (profileId !== excludeUserId) {
        const userConversations = this.userConversations.get(profileId);
        if (userConversations?.has(conversationId)) {
          ws.send(JSON.stringify(message));
        }
      }
    });
  }

  // Send message to specific user
  public sendToUser(profileId: string, message: any) {
    const ws = this.clients.get(profileId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Notify new message
  public async notifyNewMessage(message: ChatMessage) {
    // Get conversation participants
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: message.conversationId }
    });

    if (conversation) {
      const participants = [conversation.participant1Id, conversation.participant2Id];
      
      participants.forEach(participantId => {
        if (participantId !== message.senderId) {
          this.sendToUser(participantId, {
            type: 'new_message',
            data: message
          });
        }
      });
    }
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.clients.size;
  }
}

export default ChatWebSocketServer;
