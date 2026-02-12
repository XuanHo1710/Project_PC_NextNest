/**
 * Saga Orchestration — Interfaces & Types
 *
 * Defines the structure for tracking saga execution steps,
 * compensations, and overall saga state.
 */

export enum SagaStepStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  COMPENSATED = 'COMPENSATED',
}

export enum SagaStatus {
  STARTED = 'STARTED',
  SUCCESS = 'SUCCESS',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
  FAILED = 'FAILED',
}

export interface SagaStep {
  name: string;
  status: SagaStepStatus;
  executedAt?: Date;
  result?: any;
  error?: string;
}

export interface SagaContext {
  sagaId: string;
  type: string;
  status: SagaStatus;
  steps: SagaStep[];
  startedAt: Date;
  completedAt?: Date;
}
