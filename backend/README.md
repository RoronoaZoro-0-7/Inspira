# Inspira Backend API

A Node.js/Express backend with Clerk authentication, PostgreSQL database, and credit-based Q&A platform.

## Features

- ✅ Clerk authentication integration
- ✅ User data synchronization via webhooks
- ✅ Credit-based posting system
- ✅ Post creation, commenting, and upvoting
- ✅ Helpful comment marking with credit rewards
- ✅ User profiles and transaction history
- ✅ CORS configuration
- ✅ Error handling
- ✅ TypeScript support
- ✅ Prisma ORM with PostgreSQL

## Setup

### 1. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/inspira_db"

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
```

### 2. Installation & Setup

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## API Endpoints

### Public Routes (No Authentication Required)

#### Home & Posts
- `GET /api/` - Home/landing page with platform stats
- `GET /api/posts` - Fetch all posts with filters
  - Query params: `sort` (newest/trending), `category`, `page`, `limit`

#### User Profiles
- `GET /api/user/:userId` - Get public user profile

#### Comments
- `GET /api/comments/:id` - Get comment with replies

### Authenticated Routes (Require Login)

#### User Management
- `GET /api/me` - Get current user profile
- `PUT /api/profile` - Update user profile
- `DELETE /api/account` - Delete user account

#### User Content
- `GET /api/me/posts` - List user's posts
- `GET /api/me/comments` - List user's comments

#### Credits
- `GET /api/me/credits` - Get credit balance and transaction history
- `GET /api/credits` - Alias for credit balance

#### Posts
- `POST /api/posts` - Create a new post (costs 5 credits)
- `PATCH /api/posts/:id/resolve` - Mark comment as helpful (transfer credits)
- `POST /api/posts/:id/upvote` - Upvote/unupvote a post

#### Comments
- `POST /api/posts/:id/comments` - Add comment to a post
- `POST /api/comments/:id/replies` - Add reply to a comment
- `POST /api/comments/:id/upvote` - Upvote/unupvote a comment

### Webhook Endpoints
- `POST /webhook/clerk` - Clerk webhook for user sync

## Request/Response Examples

### Create a Post
```bash
POST /api/posts
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "title": "How to implement authentication?",
  "content": "I'm building a web app and need help with user authentication...",
  "categoryIds": ["coding", "authentication"],
  "imageUrls": ["https://example.com/image.jpg"],
  "videoUrls": []
}
```

### Add Comment
```bash
POST /api/posts/:postId/comments
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "content": "You can use Clerk for authentication. It's very easy to set up..."
}
```

### Mark Comment as Helpful
```bash
PATCH /api/posts/:postId/resolve
Authorization: Bearer <clerk_token>
Content-Type: application/json

{
  "commentId": "comment_id_here"
}
```

### Get Posts with Filters
```bash
GET /api/posts?sort=trending&category=coding&page=1&limit=10
```

## Credit System

### Credit Costs & Rewards
- **Post Creation**: 5 credits
- **Helpful Comment Reward**: 10 credits (transferred from post author to comment author)

### Credit Transaction Types
- `STARTER_GRANT` - Initial credits on signup
- `POST_COST` - Cost to publish a question
- `HELPFUL_REWARD` - Reward to answerer
- `PURCHASE` - User buys credits with fiat
- `ADJUSTMENT` - Admin/manual correction

## Authentication Flow

1. User signs up/logs in through Clerk frontend
2. Clerk sends webhook to `/webhook/clerk` with user data
3. Backend creates/updates user in database
4. Protected routes use `requireAuth()` and `authMiddleware`
5. `authMiddleware` verifies user exists in database and attaches user data to request

## Database Schema

The application uses PostgreSQL with the following main models:
- **User** - Clerk user data
- **Profile** - Extended user profile with credits
- **Post** - Questions/posts
- **Comment** - Comments and replies
- **Category** - Post categories
- **CreditTransaction** - Credit transaction ledger
- **HelpfulMark** - Marked helpful comments
- **PostUpvote/CommentUpvote** - Upvote tracking

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human readable error message"
}
```

Common error types:
- `Unauthorized` - Authentication required
- `Forbidden` - Insufficient permissions
- `Bad request` - Invalid input data
- `Not found` - Resource not found
- `Insufficient credits` - Not enough credits for action

## Development

### Running the Server
```bash
npm run dev  # Development with hot reload
```

### Database Commands
```bash
npx prisma migrate dev  # Run migrations
npx prisma studio      # Open database GUI
npx prisma generate    # Generate Prisma client
```

### Testing
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test protected endpoint (requires auth)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/me
```

## Troubleshooting

### Common Issues

1. **Webhook not working**: Check `CLERK_WEBHOOK_SECRET` and webhook URL
2. **Database connection**: Verify `DATABASE_URL` and PostgreSQL status
3. **CORS errors**: Ensure `FRONTEND_URL` matches your frontend
4. **User not found**: Check webhook sync and database state
5. **Credit issues**: Verify transaction logic and database constraints

### Logs
Check server logs for detailed error information and debugging.
