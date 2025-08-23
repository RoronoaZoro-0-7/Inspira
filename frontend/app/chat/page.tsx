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
import { chatApi } from "@/lib/api"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await chatApi.getConversations()
      if (response.success) {
        setConversations(response.data)
        if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0])
        }
      } else {
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
        // Scroll to bottom after messages load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
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
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
      const websocket = new WebSocket(wsUrl)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        
        // Join the current conversation if one is selected
        if (selectedConversation) {
          websocket.send(JSON.stringify({
            type: 'join',
            data: { conversationId: selectedConversation.id }
          }))
        }
      }
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
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
        if (data.data.conversationId === selectedConversation?.id) {
          setMessages(prev => [...prev, data.data])
          // Scroll to bottom for new message
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
        updateConversationList(data.data)
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
        // Add the new message with proper type
        const newMessageData: Message = {
          ...response.data,
          isRead: false,
          readAt: undefined
        }
        setMessages(prev => [...prev, newMessageData])
        setNewMessage("")
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
        // Update conversation list
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
    fetchMessages(conversation.id)
    setIsMobileView(true)
    
    // Join the conversation via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'join',
        data: { conversationId: conversation.id }
      }))
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
    if (currentUser) {
      fetchConversations()
      connectWebSocket()
    }
  }, [currentUser])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      
      // Join the conversation via WebSocket if connected
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'join',
          data: { conversationId: selectedConversation.id }
        }))
      }
    }
  }, [selectedConversation?.id, ws])

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
                      const isCurrentUser = message.senderId === currentUser?.id
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
