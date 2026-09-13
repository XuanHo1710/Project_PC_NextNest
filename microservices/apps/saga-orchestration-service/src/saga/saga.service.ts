import {
  ConflictException,
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, MICROSERVICE } from '@project-pc/common';
import { firstValueFrom } from 'rxjs';
import {
  SagaContext,
  SagaStatus,
  SagaStep,
  SagaStepStatus,
} from './interfaces/saga.interface';
import {
  SagaState,
  SagaStateDocument,
  SagaStateStatus,
} from './entities/saga-state.entity';

const SAGA_TIMEOUT_MS = 90_000;
const SAGA_TIMEOUT_MESSAGE = `SAGA_TIMEOUT_${SAGA_TIMEOUT_MS}`;

/**
 * Saga Orchestrator Service
 *
 * Implements the Saga Orchestration pattern for distributed transactions.
 * Each saga consists of a series of steps, each with a corresponding
 * compensating transaction that undoes its effect on failure.
 *
 * Flow:
 *   execute step 1 → execute step 2 → ... → execute step N → SUCCESS
 *   If step K fails (or the saga exceeds the 90s timeout):
 *     compensate step K-1 → compensate step K-2 → ... → compensate step 1 → FAILED
 */
@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);

  constructor(
    @InjectModel(SagaState.name)
    private readonly sagaStateModel: Model<SagaState>,
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @Inject(MICROSERVICE.CART_SERVICE)
    private readonly cartService: ClientProxy,
  ) {}

  // ================================================================
  //  ORDER CREATION SAGA
  // ================================================================

  /**
   * Orchestrates the full order creation flow with compensating transactions.
   *
   * CARD payment:
   *   1. Create order record (compensation: cancel order)
   *   2. Decrement stock for each variant (compensation: increment stock)
   *   3. Create payment link (compensation: expire payments)  → Return PayOS checkout URL
   *   4. Send notification (non-critical, no compensation) → Return order confirmation
   *
   *
   * COD payment:
   *   1. Create order record (compensation: cancel order)
   *   2. Decrement stock for each variant (compensation: increment stock)
   *   3. Send notification (non-critical, no compensation)
   *   → Return order confirmation
   */
  async createOrderSaga(
    createOrderDto: CreateOrderDto,
    ip: string,
    orderIdHint?: string,
  ): Promise<any> {
    const sagaId = this.generateSagaId();
    const isOnlinePayment = createOrderDto.payment.type === 'CARD';

    // Idempotency guard: an existing RUNNING saga for the same order blocks re-entry
    await this.assertNoRunningSaga(orderIdHint, sagaId);

    const state = await this.sagaStateModel.create({
      sagaId,
      orderId: orderIdHint || '',
      status: SagaStateStatus.RUNNING,
    });

    const saga: SagaContext = {
      sagaId,
      type: isOnlinePayment ? 'ORDER_CREATE_CARD' : 'ORDER_CREATE_COD',
      status: SagaStatus.STARTED,
      steps: [],
      startedAt: new Date(),
    };

    // Stack of compensating functions (executed in reverse on failure)
    const compensations: Array<{
      name: string;
      execute: () => Promise<void>;
    }> = [];

    this.logger.log(`[Saga ${sagaId}] ▶ Starting ${saga.type} saga`);

    const work = this.executeOrderCreationSteps(
      saga,
      createOrderDto,
      ip,
      compensations,
      state,
    );

    // Avoid unhandled rejection if the timeout wins the race while steps continue
    work.catch((err) => {
      this.logger.warn(
        `[Saga ${sagaId}] ⚠ Background saga promise settled after abandonment: ${
          err instanceof Error ? err.message : err
        }`,
      );
    });

    try {
      const result = await Promise.race([
        work,
        new Promise<never>((_, reject) => {
          const timer = setTimeout(
            () => reject(new Error(SAGA_TIMEOUT_MESSAGE)),
            SAGA_TIMEOUT_MS,
          );
          timer.unref?.();
        }),
      ]);

      state.status = SagaStateStatus.COMPLETED;
      await state.save();

      return result;
    } catch (error) {
      const timedOut =
        error instanceof Error && error.message === SAGA_TIMEOUT_MESSAGE;

      // ──────────────────────────────────────────────────────
      //  SAGA FAILED — Execute Compensating Transactions
      // ──────────────────────────────────────────────────────
      saga.status = SagaStatus.COMPENSATING;
      this.logger.error(
        `[Saga ${sagaId}] ✖ Saga FAILED${timedOut ? ' (TIMEOUT)' : ''} — executing ${
          compensations.length
        } compensation(s)...`,
        error instanceof Error ? error.message : error,
      );

      // Execute compensations in REVERSE order (LIFO)
      for (let i = compensations.length - 1; i >= 0; i--) {
        const comp = compensations[i];
        try {
          this.logger.log(`[Saga ${sagaId}] ↩ Compensating: ${comp.name}`);
          await comp.execute();
          this.logger.log(
            `[Saga ${sagaId}] ✔ Compensation ${comp.name} succeeded`,
          );
        } catch (compError) {
          this.logger.error(
            `[Saga ${sagaId}] ✖ Compensation ${comp.name} FAILED`,
            compError instanceof Error ? compError.message : compError,
          );
        }
      }

      saga.status = SagaStatus.COMPENSATED;
      saga.completedAt = new Date();
      this.logSagaResult(saga);

      const finalStatus = timedOut
        ? SagaStateStatus.FAILED
        : SagaStateStatus.COMPENSATED;
      state.status = finalStatus;
      try {
        await state.save();
      } catch (stateErr) {
        this.logger.error(
          `[Saga ${sagaId}] ✖ Failed to persist saga state ${finalStatus}`,
          stateErr instanceof Error ? stateErr.message : stateErr,
        );
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      // Extract meaningful error message from the failed step
      const failedStep = saga.steps.find(
        (s) => s.status === SagaStepStatus.FAILED,
      );
      let errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại.';

      if (timedOut) {
        errorMessage =
          'Hệ thống xử lý đơn hàng quá lâu. Vui lòng thử lại sau ít phút.';
      } else if (failedStep) {
        const stepError = failedStep.error || '';
        // Map specific step failures to user-friendly messages
        if (failedStep.name === 'DECREMENT_STOCK') {
          errorMessage =
            'Sản phẩm hiện đang hết hàng hoặc số lượng không đủ. Vui lòng kiểm tra lại giỏ hàng.';
        } else if (failedStep.name === 'CREATE_PAYMENT') {
          errorMessage =
            'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.';
        } else if (failedStep.name === 'CREATE_ORDER') {
          errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại sau.';
        } else if (stepError) {
          errorMessage = stepError;
        }
      }

      throw new RpcException({
        message: errorMessage,
        statusCode: 400,
      });
    }
  }

  /**
   * Runs all saga steps. Compensation registrations are pushed onto the
   * shared stack so the orchestrator can unwind them on failure or timeout.
   */
  private async executeOrderCreationSteps(
    saga: SagaContext,
    createOrderDto: CreateOrderDto,
    ip: string,
    compensations: Array<{ name: string; execute: () => Promise<void> }>,
    state: SagaStateDocument,
  ): Promise<any> {
    const sagaId = saga.sagaId;

    // ──────────────────────────────────────────────────────
    //  STEP 1: Create Order Record
    // ──────────────────────────────────────────────────────
    const order = await this.executeStep(saga, 'CREATE_ORDER', async () => {
      return await firstValueFrom(
        this.orderService.send('order.createRecord', { createOrderDto }),
      );
    });

    const orderId = order._id.toString();

    // Attach the real orderId and enforce the RUNNING guard for this order
    state.orderId = orderId;
    const runningSibling = await this.sagaStateModel.findOne({
      orderId,
      status: SagaStateStatus.RUNNING,
      _id: { $ne: state._id },
    });
    if (runningSibling) {
      throw new ConflictException('Đơn hàng đang được xử lý');
    }
    await state.save();

    // Register compensation: cancel order
    compensations.push({
      name: 'CANCEL_ORDER',
      execute: async () => {
        await firstValueFrom(
          this.orderService.send('order.cancel', { orderId }),
        );
      },
    });

    // ──────────────────────────────────────────────────────
    //  COD FLOW — STEP 2: Decrement Stock
    // ──────────────────────────────────────────────────────
    const decrementedVariants: Array<{
      variantId: string;
      quantity: number;
    }> = [];

    await this.executeStep(saga, 'DECREMENT_STOCK', async () => {
      const items = createOrderDto.orderDetail.map((item) => ({
        variantId: String((item.productVariant as any)._id),
        quantity: item.quantity,
      }));

      const result: any = await firstValueFrom(
        this.productService.send('product.variant.decrementStockBulk', {
          items,
        }),
      );

      // All-or-nothing contract: success=false means NOTHING was applied,
      // so we fail the step WITHOUT registering any stock compensation.
      if (!result?.success) {
        throw new Error(
          result?.message ||
            `Insufficient stock for variants: ${(result?.failedVariantIds || []).join(', ')}`,
        );
      }

      decrementedVariants.push(...items);
      return { decrementedCount: decrementedVariants.length };
    });

    // Register compensation: restore stock for all decremented variants
    compensations.push({
      name: 'RESTORE_STOCK',
      execute: async () => {
        if (decrementedVariants.length === 0) return;
        try {
          await firstValueFrom(
            this.productService.send('product.variant.incrementStockBulk', {
              items: decrementedVariants,
            }),
          );
        } catch (err) {
          this.logger.error(
            `[Saga ${sagaId}] ✖ CRITICAL: Failed to restore stock for ${decrementedVariants.length} variant(s)`,
            err,
          );
        }
      },
    });

    if (createOrderDto.payment.type === 'CARD') {
      // ──────────────────────────────────────────────────────
      //  CARD FLOW — STEP 3.1: Create Payment Link
      // ──────────────────────────────────────────────────────
      const paymentResult = await this.executeStep(
        saga,
        'CREATE_PAYMENT',
        async () => {
          return await firstValueFrom(
            this.paymentService.send('payment.create', {
              createPaymentDto: {
                order: orderId,
                amount: order.totalAmount,
                guestId: createOrderDto.customerInfo.guestId,
              },
              ip,
            }),
          );
        },
      );

      // Register compensation: expire payment records
      compensations.push({
        name: 'EXPIRE_PAYMENT',
        execute: async () => {
          await firstValueFrom(
            this.paymentService.send('payment.expireByOrderId', { orderId }),
          );
        },
      });

      // ── SAGA SUCCESS (CARD) ──
      saga.status = SagaStatus.SUCCESS;
      saga.completedAt = new Date();
      this.logSagaResult(saga);

      return {
        orderId,
        url: paymentResult.url,
        orderCode: paymentResult.orderCode,
        paymentType: 'CARD',
      };
    } else {
      // ──────────────────────────────────────────────────────
      //  COD FLOW — STEP 3.2: Send Notification (tracked in saga)
      // ──────────────────────────────────────────────────────
      await this.executeStep(
        saga,
        'SEND_NOTIFICATION',
        async () => {
          return await firstValueFrom(
            this.notificationService.send(
              'notification.sendOrderConfirmation',
              {
                email: createOrderDto.customerInfo.email,
                orderId,
                amount: order.totalAmount,
                orderItems: createOrderDto.orderDetail.map((item: any) => ({
                  productVariant: item.productVariant._id,
                  productName: item.product?.name || '',
                  combination: item.productVariant?.combination || {},
                  quantity: item.quantity,
                  price: item.price,
                  subtotal: item.subtotal,
                })),
                paymentMethod: 'COD',
                customerName: createOrderDto.customerInfo.fullname,
              },
            ),
          );
        },
        true, // non-critical — don't fail saga if notification fails
      );

      // ── SAGA SUCCESS (COD) ──
      saga.status = SagaStatus.SUCCESS;
      saga.completedAt = new Date();
      this.logSagaResult(saga);

      return {
        orderId,
        paymentType: 'COD',
        totalAmount: order.totalAmount,
        customerInfo: order.customerInfo,
      };
    }
  }

  private async assertNoRunningSaga(
    orderId: string | undefined,
    currentSagaId: string,
  ) {
    if (!orderId) return;
    const running = await this.sagaStateModel.findOne({
      orderId,
      status: SagaStateStatus.RUNNING,
      sagaId: { $ne: currentSagaId },
    });
    if (running) {
      throw new ConflictException('Đơn hàng đang được xử lý');
    }
  }

  // ================================================================
  //  SAGA STEP EXECUTION
  // ================================================================

  /**
   * Executes a single saga step with tracking and logging.
   *
   * @param saga - The saga context for step tracking
   * @param stepName - Human-readable step name
   * @param fn - The async function to execute
   * @param nonCritical - If true, step failure won't fail the saga
   * @returns The result of the step execution
   */
  private async executeStep<T>(
    saga: SagaContext,
    stepName: string,
    fn: () => Promise<T>,
    nonCritical = false,
  ): Promise<T> {
    const step: SagaStep = {
      name: stepName,
      status: SagaStepStatus.PENDING,
      executedAt: new Date(),
    };
    saga.steps.push(step);

    this.logger.log(
      `[Saga ${saga.sagaId}] → Step ${saga.steps.length}: ${stepName}`,
    );

    try {
      const result = await fn();
      step.status = SagaStepStatus.SUCCESS;
      step.result = result;
      this.logger.log(`[Saga ${saga.sagaId}] ✔ Step ${stepName} succeeded`);
      return result;
    } catch (error) {
      step.status = SagaStepStatus.FAILED;
      step.error = error instanceof Error ? error.message : String(error);

      if (nonCritical) {
        this.logger.warn(
          `[Saga ${saga.sagaId}] ⚠ Step ${stepName} failed (non-critical): ${step.error}`,
        );
        return undefined as T;
      }

      this.logger.error(
        `[Saga ${saga.sagaId}] ✖ Step ${stepName} FAILED: ${step.error}`,
      );
      throw error;
    }
  }

  // ================================================================
  //  UTILITIES
  // ================================================================

  private generateSagaId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `saga_${timestamp}_${random}`;
  }

  private logSagaResult(saga: SagaContext): void {
    const duration = saga.completedAt
      ? saga.completedAt.getTime() - saga.startedAt.getTime()
      : 0;

    const stepSummary = saga.steps
      .map((s) => `${s.name}:${s.status}`)
      .join(' → ');

    if (saga.status === SagaStatus.SUCCESS) {
      this.logger.log(
        `[Saga ${saga.sagaId}] ✔ COMPLETED in ${duration}ms | ${stepSummary}`,
      );
    } else {
      this.logger.error(
        `[Saga ${saga.sagaId}] ✖ ${saga.status} in ${duration}ms | ${stepSummary}`,
      );
    }
  }
}
