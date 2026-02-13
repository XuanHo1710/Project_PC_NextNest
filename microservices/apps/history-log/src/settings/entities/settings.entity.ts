import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ unique: true, required: true })
  key: string;

  @Prop({ type: Object, default: {} })
  value: Record<string, any>;

  @Prop({ default: 'general' })
  group: string; // general, appearance, notification, email, security

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
