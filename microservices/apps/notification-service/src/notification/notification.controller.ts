import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.sendMail')
  create(
    @Payload() data: { email: string; orderId: string; description: string },
  ) {
    return this.notificationService.sendMail(
      data.email,
      data.orderId,
      data.description,
    );
  }
}
