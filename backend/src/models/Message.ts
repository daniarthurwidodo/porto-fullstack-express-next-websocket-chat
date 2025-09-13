import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId | 'all'; // 'all' for group messages
  content: string;
  timestamp: Date;
  messageType: 'text' | 'system';
  isEdited: boolean;
  editedAt?: Date;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.Mixed, // Can be ObjectId or 'all'
    required: true,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);
