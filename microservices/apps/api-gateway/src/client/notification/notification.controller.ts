import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'decorators/customize';

@Controller('/client/notification')
export class NotificationController {
  constructor(
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.notificationService.send('notification.findAll', {
      filter: {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search: search || '',
      },
    });
  }
}
