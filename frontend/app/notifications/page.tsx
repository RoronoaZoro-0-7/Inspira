import { Bell, Check, X, MessageSquare, TrendingUp, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "upvote",
      title: "Your answer was upvoted",
      message: 'Dr. Sarah Chen upvoted your answer to "How to optimize neural networks?"',
      time: "2 minutes ago",
      unread: true,
      avatar: "/sarah-avatar.png",
      credits: 2,
    },
    {
      id: 2,
      type: "helpful",
      title: "Answer marked as helpful",
      message: 'Your answer to "Best practices for data preprocessing" was marked as helpful',
      time: "1 hour ago",
      unread: true,
      avatar: "/marcus-avatar.png",
      credits: 10,
    },
    {
      id: 3,
      type: "comment",
      title: "New comment on your post",
      message: 'Emily Rodriguez commented on "Machine Learning Career Path"',
      time: "3 hours ago",
      unread: false,
      avatar: "/emily-avatar.png",
    },
    {
      id: 4,
      type: "follow",
      title: "New follower",
      message: "Alex Thompson started following you",
      time: "1 day ago",
      unread: false,
      avatar: "/diverse-user-avatars.png",
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "upvote":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "helpful":
        return <Star className="h-4 w-4 text-yellow-600" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "follow":
        return <Users className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your community activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread (2)</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${notification.unread ? "border-blue-200 bg-blue-50/30" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getIcon(notification.type)}
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {notification.unread && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                        {notification.credits && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            +{notification.credits} credits
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-sm text-gray-500">{notification.time}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {notifications
              .filter((n) => n.unread)
              .map((notification) => (
                <Card key={notification.id} className="border-blue-200 bg-blue-50/30 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getIcon(notification.type)}
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                          {notification.credits && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              +{notification.credits} credits
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600">{notification.message}</p>
                        <p className="text-sm text-gray-500">{notification.time}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            {notifications
              .filter((n) => n.credits)
              .map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getIcon(notification.type)}
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <Badge variant="outline" className="text-xs text-green-600">
                            +{notification.credits} credits
                          </Badge>
                        </div>
                        <p className="text-gray-600">{notification.message}</p>
                        <p className="text-sm text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            {notifications
              .filter((n) => ["comment", "follow"].includes(n.type))
              .map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getIcon(notification.type)}
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        </div>
                        <p className="text-gray-600">{notification.message}</p>
                        <p className="text-sm text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
