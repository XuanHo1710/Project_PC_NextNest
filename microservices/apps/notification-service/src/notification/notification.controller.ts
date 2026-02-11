import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification_create')
  create(@Payload() data: { createNotificationDto: CreateNotificationDto }) {
    return this.notificationService.create(data.createNotificationDto);
  }

  @MessagePattern('notification_findAll')
  findAll() {
    return this.notificationService.findAll();
  }

  @MessagePattern('notification_findOne')
  findOne(@Payload() data: { id: string }) {
    return this.notificationService.findOne(data.id);
  }

  @MessagePattern('notification_update')
  update(
    @Payload()
    data: {
      id: string;
      updateNotificationDto: UpdateNotificationDto;
    },
  ) {
    return this.notificationService.update(data.id, data.updateNotificationDto);
  }

  @MessagePattern('notification_remove')
  remove(@Payload() data: { id: string }) {
    return this.notificationService.remove(data.id);
  }
}
