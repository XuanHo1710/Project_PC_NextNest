import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HistoryDocument = History & Document;

@Schema({ timestamps: true })
export class History {
  @Prop({ required: true })
  adminId: string;

  @Prop()
  adminName: string;

  @Prop()
  method: string;

  @Prop()
  path: string;

  @Prop({ type: Object })
  body: any;

  @Prop()
  description: string;
}

export const HistorySchema = SchemaFactory.createForClass(History);

// === INDEXES for query optimization ===
HistorySchema.index({ adminId: 1, createdAt: -1 });
HistorySchema.index({ createdAt: -1 });

// TTL index: auto-delete history entries after 90 days
HistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
