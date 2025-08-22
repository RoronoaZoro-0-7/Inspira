"use client"

import type React from "react"

import { useState } from "react"
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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock chat data
const mockChats = [
  {
    id: 1,
    user: {
      name: "Marcus Rodriguez",
      avatar: "/marcus-avatar.png",
      email: "marcus@example.com",
      isOnline: true,
    },
    lastMessage: "Thanks for the help with the authentication issue!",
    timestamp: "2 min ago",
    unreadCount: 2,
  },
  {
    id: 2,
    user: {
      name: "Emily Watson",
      avatar: "/emily-avatar.png",
      email: "emily@example.com",
      isOnline: false,
    },
    lastMessage: "I'll check out that React documentation you mentioned",
    timestamp: "1 hour ago",
    unreadCount: 0,
  },
  {
    id: 3,
    user: {
      name: "Alex Kim",
      avatar: "/placeholder.svg",
      email: "alex@example.com",
      isOnline: true,
    },
    lastMessage: "Great explanation on the TypeScript generics post",
    timestamp: "3 hours ago",
    unreadCount: 1,
  },
  {
    id: 4,
    user: {
      name: "Lisa Park",
      avatar: "/placeholder.svg",
      email: "lisa@example.com",
      isOnline: false,
    },
    lastMessage: "Could you help me with my CSS Grid layout?",
    timestamp: "1 day ago",
    unreadCount: 0,
  },
]

const mockMessages = [
  {
    id: 1,
    senderId: "marcus@example.com",
    content: "Hey! I saw your answer on the Next.js authentication post. Really helpful!",
    timestamp: "10:30 AM",
    isCurrentUser: false,
  },
  {
    id: 2,
    senderId: "john@example.com",
    content: "Thanks! I'm glad it helped. Are you working on a similar project?",
    timestamp: "10:32 AM",
    isCurrentUser: true,
  },
  {
    id: 3,
    senderId: "marcus@example.com",
    content:
      "Yes, I'm building a SaaS app and struggling with the middleware configuration. Your example was exactly what I needed.",
    timestamp: "10:35 AM",
    isCurrentUser: false,
  },
  {
    id: 4,
    senderId: "john@example.com",
    content:
      "That's awesome! If you run into any other issues, feel free to ask. I've been through most of the common pitfalls.",
    timestamp: "10:37 AM",
    isCurrentUser: true,
  },
  {
    id: 5,
    senderId: "marcus@example.com",
    content: "Thanks for the help with the authentication issue! I got it working perfectly.",
    timestamp: "10:45 AM",
    isCurrentUser: false,
  },
]

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0])
  const [newMessage, setNewMessage] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message via WebSocket or API
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

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
            <h1 className="text-xl font-serif font-bold text-foreground mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat.id === chat.id ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setSelectedChat(chat)
                    setIsMobileView(true)
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.user.avatar || "/placeholder.svg"} alt={chat.user.name} />
                      <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate">{chat.user.name}</p>
                      <span className="text-xs text-muted">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Interface */}
        <div className={`flex-1 flex flex-col ${!isMobileView ? "" : "w-full"}`}>
          {selectedChat ? (
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
                      <AvatarImage src={selectedChat.user.avatar || "/placeholder.svg"} alt={selectedChat.user.name} />
                      <AvatarFallback>{selectedChat.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedChat.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedChat.user.name}</p>
                    <p className="text-xs text-muted flex items-center">
                      <Circle
                        className={`w-2 h-2 mr-1 ${selectedChat.user.isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"}`}
                      />
                      {selectedChat.user.isOnline ? "Online" : "Offline"}
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
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}>
                        {!message.isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={selectedChat.user.avatar || "/placeholder.svg"}
                              alt={selectedChat.user.name}
                            />
                            <AvatarFallback className="text-xs">{selectedChat.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            message.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.isCurrentUser ? "text-primary-foreground/70" : "text-muted"
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
