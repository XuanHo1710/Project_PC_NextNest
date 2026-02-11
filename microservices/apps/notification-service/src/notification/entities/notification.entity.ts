import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;
@Schema({ timestamps: true })
export class Notification {
  _id: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
