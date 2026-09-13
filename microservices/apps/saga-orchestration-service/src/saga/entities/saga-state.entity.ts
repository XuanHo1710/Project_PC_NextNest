import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SagaStateDocument = HydratedDocument<SagaState>;

export enum SagaStateStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATED = 'COMPENSATED',
}

@Schema({ timestamps: true })
export class SagaState {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  sagaId: string;

  @Prop({ type: String, default: '' })
  orderId: string;

  @Prop({
    type: String,
    enum: Object.values(SagaStateStatus),
    default: SagaStateStatus.RUNNING,
  })
  status: string;

  createdAt: Date;

  updatedAt: Date;
}

export const SagaStateSchema = SchemaFactory.createForClass(SagaState);

SagaStateSchema.index({ orderId: 1, status: 1 });
