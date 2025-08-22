import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { Webhook } from 'svix';
import authMiddleware from "./middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Define WebhookEvent type locally since @clerk/nextjs/server is not installed
interface WebhookEvent {
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
  type: string;
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware
app.use(clerkMiddleware());

// Webhook endpoint for Clerk user sync
app.post('/webhook/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const payload = req.body;
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Error verifying webhook' });
  }

  const { id, email_addresses, ...attributes } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const email = email_addresses?.[0]?.email_address;
    
    if (!email) {
      return res.status(400).json({ error: 'No email found' });
    }

    try {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: email,
          updatedAt: new Date(),
        },
        create: {
          clerkId: id,
          email: email,
          profile: {
            create: {
              name: attributes.first_name && attributes.last_name 
                ? `${attributes.first_name} ${attributes.last_name}` 
                : attributes.first_name || attributes.last_name || null,
              imageUrl: attributes.image_url || null,
            }
          }
        },
      });
    } catch (error) {
      console.error('Error syncing user:', error);
      return res.status(500).json({ error: 'Error syncing user' });
    }
  }

  res.status(200).json({ success: true });
});

app.get("/", (req, res) => {
    res.send("Hello World");
});


app.get("/protectedWithOutDbCall", requireAuth(), (req, res) => {
    res.send("Hello World");
});

app.get("/protected", requireAuth(), authMiddleware, (req, res) => {
    res.json({ message: "Protected route", user: req.user });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default prisma;