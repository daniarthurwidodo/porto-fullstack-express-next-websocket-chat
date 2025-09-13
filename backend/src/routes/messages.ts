import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get messages between current user and another user
router.get('/:recipientId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.params;
    const { limit = 50, before } = req.query;

    // Validate recipient
    if (recipientId !== 'all' && !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    const query: any = {
      $or: [
        // Messages where current user is sender and recipient is the target
        { 
          sender: req.user!._id, 
          recipient: recipientId === 'all' ? 'all' : new mongoose.Types.ObjectId(recipientId) 
        },
        // Messages where current user is recipient and sender is the target
        { 
          sender: recipientId === 'all' ? { $exists: true } : new mongoose.Types.ObjectId(recipientId),
          recipient: req.user!._id
        }
      ]
    };

    // For pagination
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50)
      .lean();

    // Mark messages as read
    if (recipientId !== 'all') {
      await Message.updateMany(
        { 
          sender: new mongoose.Types.ObjectId(recipientId),
          recipient: req.user!._id,
          isRead: false 
        },
        { $set: { isRead: true } }
      );
    }

    res.json({ messages: messages.reverse() });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new message
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content, recipientId = 'all' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (recipientId !== 'all' && !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    const message = new Message({
      sender: req.user!._id,
      recipient: recipientId === 'all' ? 'all' : recipientId,
      content: content.trim(),
      isRead: recipientId === 'all' // Group messages are marked as read by default
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // If this is a private message, populate the recipient
    if (message.recipient !== 'all') {
      await message.populate('recipient', 'username avatar');
    }

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.post('/mark-read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { senderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: 'Invalid sender ID' });
    }

    await Message.updateMany(
      { 
        sender: new mongoose.Types.ObjectId(senderId),
        recipient: req.user!._id,
        isRead: false 
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
