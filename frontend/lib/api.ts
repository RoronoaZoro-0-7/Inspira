import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreatePostData {
  title: string;
  content: string;
  categoryIds: string[]; // Backend expects categoryIds array
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  categoryIds: string[];
  categories: Category[];
  authorId: string;
  author: {
    name: string;
    imageUrl?: string;
  };
  upvotes: number;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    // For client-side components, we'll get the token from the browser
    // This will be handled by the Clerk middleware on the server side
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

async function makeApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API request failed: ${response.statusText}`
    );
  }

  return response.json();
}

// Post API functions
export const postApi = {
  async create(data: CreatePostData): Promise<ApiResponse<Post>> {
    return makeApiRequest<ApiResponse<Post>>('/api/posts/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: 'newest' | 'trending';
  }): Promise<ApiResponse<{ posts: Post[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/api/posts/posts${queryString ? `?${queryString}` : ''}`;
    
    return makeApiRequest<ApiResponse<{ posts: Post[]; pagination: any }>>(endpoint);
  },

  async getById(id: string): Promise<ApiResponse<Post>> {
    return makeApiRequest<ApiResponse<Post>>(`/api/posts/${id}`);
  },

  async upvote(id: string): Promise<ApiResponse<{ upvotes: number }>> {
    return makeApiRequest<ApiResponse<{ upvotes: number }>>(`/api/posts/${id}/upvote`, {
      method: 'POST',
    });
  },

  async getCategoryCounts(): Promise<ApiResponse<{
    categories: Array<{
      name: string;
      count: number;
    }>;
  }>> {
    return makeApiRequest<ApiResponse<{
      categories: Array<{
        name: string;
        count: number;
      }>;
    }>>('/api/posts/categories');
  },
};

// User API functions
export const userApi = {
  async getProfile(): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    credits: number;
    imageUrl?: string;
  }>> {
    return makeApiRequest<ApiResponse<{
      id: string;
      name: string;
      email: string;
      credits: number;
      imageUrl?: string;
    }>>('/api/auth/me');
  },

  async getPosts(): Promise<ApiResponse<Post[]>> {
    return makeApiRequest<ApiResponse<Post[]>>('/api/auth/me/posts');
  },

  async getCredits(): Promise<ApiResponse<{
    balance: number;
    transactions: Array<{
      id: string;
      amount: number;
      type: 'earned' | 'spent';
      description: string;
      createdAt: string;
    }>;
  }>> {
    return makeApiRequest<ApiResponse<{
      balance: number;
      transactions: Array<{
        id: string;
        amount: number;
        type: 'earned' | 'spent';
        description: string;
        createdAt: string;
      }>;
    }>>('/api/auth/me/credits');
  },
};

// Chat API functions
export const chatApi = {
  async getConversations(): Promise<ApiResponse<Array<{
    id: string;
    otherParticipant: {
      id: string;
      name: string;
      imageUrl?: string;
    };
    lastMessage?: {
      content: string;
      createdAt: string;
      senderId: string;
    };
    messageCount: number;
    updatedAt: string;
    createdAt: string;
  }>>> {
    return makeApiRequest<ApiResponse<Array<{
      id: string;
      otherParticipant: {
        id: string;
        name: string;
        imageUrl?: string;
      };
      lastMessage?: {
        content: string;
        createdAt: string;
        senderId: string;
      };
      messageCount: number;
      updatedAt: string;
      createdAt: string;
    }>>>('/api/chat/conversations');
  },

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<ApiResponse<{
    messages: Array<{
      id: string;
      conversationId: string;
      senderId: string;
      content: string;
      messageType: string;
      fileUrl?: string;
      createdAt: string;
      isRead: boolean;
      readAt?: string;
      sender: {
        id: string;
        name: string;
        imageUrl?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    return makeApiRequest<ApiResponse<{
      messages: Array<{
        id: string;
        conversationId: string;
        senderId: string;
        content: string;
        messageType: string;
        fileUrl?: string;
        createdAt: string;
        isRead: boolean;
        readAt?: string;
        sender: {
          id: string;
          name: string;
          imageUrl?: string;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`/api/chat/conversations/${conversationId}/messages?${searchParams.toString()}`);
  },

  async sendMessage(conversationId: string, content: string, messageType = 'TEXT', fileUrl?: string): Promise<ApiResponse<{
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
  }>> {
    return makeApiRequest<ApiResponse<{
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
    }>>(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType, fileUrl }),
    });
  },

  async createConversation(participantId: string): Promise<ApiResponse<{
    id: string;
    otherParticipant: {
      id: string;
      name: string;
      imageUrl?: string;
    };
    lastMessage?: {
      content: string;
      createdAt: string;
      senderId: string;
    };
    createdAt: string;
    updatedAt: string;
  }>> {
    return makeApiRequest<ApiResponse<{
      id: string;
      otherParticipant: {
        id: string;
        name: string;
        imageUrl?: string;
      };
      lastMessage?: {
        content: string;
        createdAt: string;
        senderId: string;
      };
      createdAt: string;
      updatedAt: string;
    }>>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  },

  async searchUsers(query: string, page = 1, limit = 20): Promise<ApiResponse<{
    users: Array<{
      id: string;
      name: string;
      imageUrl?: string;
      bio?: string;
      user: {
        email: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    return makeApiRequest<ApiResponse<{
      users: Array<{
        id: string;
        name: string;
        imageUrl?: string;
        bio?: string;
        user: {
          email: string;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`/api/chat/users?${searchParams.toString()}`);
  },
};

// Comment API functions
export const commentApi = {
  async create(postId: string, content: string): Promise<ApiResponse<{
    id: string;
    content: string;
    authorId: string;
    postId: string;
    upvotes: number;
    createdAt: string;
  }>> {
    return makeApiRequest<ApiResponse<{
      id: string;
      content: string;
      authorId: string;
      postId: string;
      upvotes: number;
      createdAt: string;
    }>>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async getByPostId(postId: string): Promise<ApiResponse<Array<{
    id: string;
    content: string;
    authorId: string;
    postId: string;
    upvotes: number;
    createdAt: string;
    author: {
      name: string;
      imageUrl?: string;
    };
    replies: Array<{
      id: string;
      content: string;
      authorId: string;
      createdAt: string;
      author: {
        name: string;
        imageUrl?: string;
      };
      _count: {
        upvotes: number;
      };
    }>;
    _count: {
      upvotes: number;
      replies: number;
    };
  }>>> {
    return makeApiRequest<ApiResponse<Array<{
      id: string;
      content: string;
      authorId: string;
      postId: string;
      upvotes: number;
      createdAt: string;
      author: {
        name: string;
        imageUrl?: string;
      };
      replies: Array<{
        id: string;
        content: string;
        authorId: string;
        createdAt: string;
        author: {
          name: string;
          imageUrl?: string;
        };
        _count: {
          upvotes: number;
        };
      }>;
      _count: {
        upvotes: number;
        replies: number;
      };
    }>>>(`/api/posts/${postId}/comments`);
  },

  async upvote(id: string): Promise<ApiResponse<{ upvotes: number }>> {
    return makeApiRequest<ApiResponse<{ upvotes: number }>>(`/api/comments/${id}/upvote`, {
      method: 'POST',
    });
  },

  async reply(commentId: string, content: string): Promise<ApiResponse<{
    id: string;
    content: string;
    authorId: string;
    postId: string;
    createdAt: string;
    author: {
      name: string;
      imageUrl?: string;
    };
  }>> {
    return makeApiRequest<ApiResponse<{
      id: string;
      content: string;
      authorId: string;
      postId: string;
      createdAt: string;
      author: {
        name: string;
        imageUrl?: string;
      };
    }>>(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};
