"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  ArrowLeft,
  Circle,
  MessageSquare,
  Loader2,
  Plus,
  UserPlus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { chatApi, userApi } from "@/lib/api"

// Interfaces for chat data
interface ChatUser {
  id: string;
  name: string;
  imageUrl?: string;
  email?: string;
}

interface Conversation {
  id: string;
  otherParticipant: ChatUser;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  messageCount: number;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  fileUrl?: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  sender: ChatUser;
}

export default function ChatPage() {
  const { user: currentUser } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    imageUrl?: string;
    bio?: string;
    user: { email: string };
  }>>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const selectedConversationRef = useRef<Conversation | null>(null)

  // Fetch current user profile ID
  const fetchCurrentUserProfile = async () => {
    try {
      console.log('Fetching current user profile...')
      const response = await userApi.getProfile()
      console.log('Profile response:', response)
      if (response.success && response.data) {
        setCurrentUserProfileId(response.data.id)
        console.log('Current user profile ID set:', response.data.id)
      }
    } catch (err) {
      console.error("Error fetching current user profile:", err)
    }
  }

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching conversations...')
      const response = await chatApi.getConversations()
      console.log('Conversations response:', response)
      if (response.success) {
        console.log('Fetched conversations:', response.data.length)
        setConversations(response.data)
        if (response.data.length > 0 && !selectedConversation) {
          console.log('Setting first conversation as selected:', response.data[0].id)
          setSelectedConversation(response.data[0])
          selectedConversationRef.current = response.data[0]
        }
      } else {
        console.log('Failed to fetch conversations:', response)
        setError("Failed to fetch conversations")
        toast.error("Failed to load conversations")
      }
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setError("Failed to fetch conversations")
      toast.error("Failed to load conversations")
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true)
      const response = await chatApi.getMessages(conversationId)
      if (response.success) {
        setMessages(response.data.messages)
        // Don't auto-scroll to bottom when loading messages
        // Users can scroll manually to see latest messages
      } else {
        toast.error("Failed to load messages")
      }
    } catch (err) {
      console.error("Error fetching messages:", err)
      toast.error("Failed to load messages")
    } finally {
      setMessagesLoading(false)
    }
  }

  // WebSocket connection
  const connectWebSocket = () => {
    try {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://skill-share-micro-economy-2.onrender.com'
      const websocket = new WebSocket(wsUrl)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        
        // Join the current conversation if one is selected
        if (selectedConversation) {
          const joinMessage = {
            type: 'join',
            data: { conversationId: selectedConversation.id }
          }
          console.log('Joining conversation:', joinMessage)
          websocket.send(JSON.stringify(joinMessage))
        }
      }
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      
      setWs(websocket)
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
    }
  }

  const updateConversationList = (newMessage: Message) => {
    setConversations(prev => {
      const newConversations = [...prev]
      const conversationIndex = newConversations.findIndex(c => c.id === newMessage.conversationId)
      if (conversationIndex !== -1) {
        const conversation = newConversations[conversationIndex]
        conversation.lastMessage = {
          content: newMessage.content,
          createdAt: newMessage.createdAt,
          senderId: newMessage.senderId
        }
        conversation.updatedAt = newMessage.createdAt
        newConversations.splice(conversationIndex, 1)
        newConversations.unshift(conversation)
      }
      return newConversations
    })
  }

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        console.log('Processing new message:', data.data)
        console.log('Current selected conversation (state):', selectedConversation?.id)
        console.log('Current selected conversation (ref):', selectedConversationRef.current?.id)
        console.log('Message conversation ID:', data.data.conversationId)
        
        // Always update conversation list regardless of current selection
        updateConversationList(data.data)
        
        // Use ref for immediate access to current conversation
        const currentConversation = selectedConversationRef.current || selectedConversation
        
        // If we have a selected conversation and it matches, add to messages
        if (currentConversation && data.data.conversationId === currentConversation.id) {
          console.log('Message matches current conversation, adding to messages')
          // Check if message already exists to avoid duplicates
          setMessages(prev => {
            console.log('Current messages count:', prev.length)
            const messageExists = prev.some(msg => msg.id === data.data.id)
            console.log('Message already exists:', messageExists)
            if (!messageExists) {
              console.log('Adding new message to state')
              const newMessages = [...prev, data.data]
              console.log('New messages count:', newMessages.length)
              return newMessages
            }
            console.log('Message already exists, not adding')
            return prev
          })
          // Don't auto-scroll to bottom for new messages
          // Users can scroll manually to see new messages
        } else {
          console.log('Message does not match current conversation or no conversation selected')
          // If no conversation is selected, try to find and select the conversation
          if (!currentConversation) {
            const conversation = conversations.find(c => c.id === data.data.conversationId)
            if (conversation) {
              console.log('Auto-selecting conversation:', conversation.id)
              setSelectedConversation(conversation)
              selectedConversationRef.current = conversation
              // Fetch messages for this conversation
              fetchMessages(conversation.id)
            }
          }
        }
        break
      case 'typing':
        // Handle typing indicators
        break
      case 'message_read':
        // Handle read receipts
        break
      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await chatApi.sendMessage(selectedConversation.id, newMessage.trim())
      if (response.success) {
        // Clear the input immediately for better UX
        setNewMessage("")
        
        // The message will be added via WebSocket notification
        // This ensures real-time updates work properly
        
        // Update conversation list
        const newMessageData: Message = {
          ...response.data,
          isRead: false,
          readAt: undefined
        }
        updateConversationList(newMessageData)
      } else {
        toast.error("Failed to send message")
      }
    } catch (err) {
      console.error("Error sending message:", err)
      toast.error("Failed to send message")
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    selectedConversationRef.current = conversation
    fetchMessages(conversation.id)
    setIsMobileView(true)
    
    // Join the conversation via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      const joinMessage = {
        type: 'join',
        data: { conversationId: conversation.id }
      }
      console.log('Joining conversation on selection:', joinMessage)
      ws.send(JSON.stringify(joinMessage))
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  // Initialize data and WebSocket connection
  useEffect(() => {
    console.log('Current user state:', currentUser)
    if (currentUser) {
      console.log('User is signed in, fetching data...')
      fetchCurrentUserProfile()
      fetchConversations()
      connectWebSocket()
    } else {
      console.log('User is not signed in')
    }
  }, [currentUser])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      
      // Join the conversation via WebSocket if connected
      if (ws && ws.readyState === WebSocket.OPEN) {
        const joinMessage = {
          type: 'join',
          data: { conversationId: selectedConversation.id }
        }
        console.log('Joining conversation in useEffect:', joinMessage)
        ws.send(JSON.stringify(joinMessage))
      }
    }
  }, [selectedConversation?.id, ws])

  // Monitor messages state changes
  useEffect(() => {
    console.log('Messages state updated:', messages.length, 'messages')
  }, [messages])

  // Auto-select first conversation if none is selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      console.log('Auto-selecting first conversation:', conversations[0].id)
      setSelectedConversation(conversations[0])
      selectedConversationRef.current = conversations[0]
    }
  }, [conversations, selectedConversation])

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await chatApi.searchUsers(query)
      if (response.success) {
        setSearchResults(response.data.users)
      } else {
        toast.error("Failed to search users")
      }
    } catch (err) {
      console.error("Error searching users:", err)
      toast.error("Failed to search users")
    } finally {
      setSearching(false)
    }
  }

  // Start conversation with user
  const startConversation = async (userId: string) => {
    try {
      const response = await chatApi.createConversation(userId)
      if (response.success) {
        // Create conversation object with proper type
        const newConversation: Conversation = {
          ...response.data,
          messageCount: 0 // New conversation has no messages yet
        }
        // Add new conversation to list
        setConversations(prev => [newConversation, ...prev])
        // Select the new conversation
        setSelectedConversation(newConversation)
        // Close search
        setShowSearch(false)
        setSearchQuery("")
        setSearchResults([])
        toast.success("Conversation started!")
      } else {
        toast.error("Failed to start conversation")
      }
    } catch (err) {
      console.error("Error starting conversation:", err)
      toast.error("Failed to start conversation")
    }
  }

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [ws])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex h-full bg-card rounded-lg border overflow-hidden">
        {/* Chat List */}
        <div className={`w-80 border-r border-border flex flex-col ${isMobileView ? "hidden" : ""}`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-serif font-bold text-foreground">Messages</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="h-8"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {showSearch ? "Cancel" : "New Chat"}
              </Button>
            </div>
            
            {showSearch ? (
              <div className="space-y-3">
                <div className="text-sm text-muted mb-2">
                  Search for users by name or email to start a conversation
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                  <Input 
                    placeholder="Type name or email to search users..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted">Searching...</span>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="text-xs text-muted mb-2">
                      Click on a user to start a conversation
                    </div>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border transition-colors"
                        onClick={() => startConversation(user.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="text-sm">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted truncate">{user.user.email}</p>
                          {user.bio && (
                            <p className="text-xs text-muted truncate mt-1">{user.bio}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && !searching && searchResults.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted">No users found</p>
                    <p className="text-xs text-muted mt-1">Try searching with a different name or email</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-muted">Loading conversations...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted">{error}</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted mb-4" />
                <p className="text-muted mb-2">No conversations yet</p>
                <p className="text-sm text-muted mb-4">Start chatting with other users!</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearch(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Start Your First Chat
                </Button>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.otherParticipant.imageUrl || "/placeholder.svg"} alt={conversation.otherParticipant.name} />
                        <AvatarFallback>{conversation.otherParticipant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground truncate">{conversation.otherParticipant.name}</p>
                        <span className="text-xs text-muted">{formatTimestamp(conversation.updatedAt)}</span>
                      </div>
                      <p className="text-sm text-muted truncate">
                        {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Interface */}
        <div className={`flex-1 flex flex-col ${!isMobileView ? "" : "w-full"}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobileView && (
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileView(false)} className="md:hidden">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.otherParticipant.imageUrl || "/placeholder.svg"} alt={selectedConversation.otherParticipant.name} />
                      <AvatarFallback>{selectedConversation.otherParticipant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedConversation.otherParticipant.name}</p>
                    <p className="text-xs text-muted flex items-center">
                      <Circle className="w-2 h-2 mr-1 fill-gray-400 text-gray-400" />
                      Offline
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>

                      <DropdownMenuItem>Block User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                {messagesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2 text-muted">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      // Check if the message sender is the current user
                      const isCurrentUser = message.senderId === currentUserProfileId
                      
                      return (
                        <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={selectedConversation.otherParticipant.imageUrl || "/placeholder.svg"}
                                  alt={selectedConversation.otherParticipant.name}
                                />
                                <AvatarFallback className="text-xs">{selectedConversation.otherParticipant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-3 py-2 ${
                                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? "text-primary-foreground/70" : "text-muted"
                                }`}
                              >
                                {formatTimestamp(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-10"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
