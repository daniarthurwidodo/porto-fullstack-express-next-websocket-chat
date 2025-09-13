import express, { Request, Response } from 'express';
import Message from '../models/Message';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all messages
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new message
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = new Message({
      sender: req.user!._id,
      content: content.trim()
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
