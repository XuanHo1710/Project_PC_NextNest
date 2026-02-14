import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  _id: Types.ObjectId;

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String, default: '' },
        role: { type: String, enum: ['buyer', 'seller'], required: true },
      },
    ],
    required: true,
  })
  participants: {
    userId: string;
    name: string;
    avatar: string;
    role: 'buyer' | 'seller';
  }[];

  @Prop({
    type: {
      content: { type: String },
      senderId: { type: String },
      timestamp: { type: Date },
    },
    default: null,
  })
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Date;
  } | null;

  @Prop({ default: 'DIRECT', enum: ['DIRECT'] })
  type: string;

  @Prop({
    type: Map,
    of: Number,
    default: {},
  })
  unreadCount: Map<string, number>;

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Index for fast lookup by participant
ConversationSchema.index({ 'participants.userId': 1 });
ConversationSchema.index({ updatedAt: -1 });
