import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';

@Controller('/admin/settings')
export class SettingsController {
  constructor(
    @Inject(MICROSERVICE.HISTORY_LOG_SERVICE)
    private readonly historyLogService: ClientProxy,
  ) {}

  @Get()
  findAll() {
    return this.historyLogService.send('settings.getAll', {});
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.historyLogService.send('settings.getByKey', { key });
  }

  @Patch(':key')
  update(
    @Param('key') key: string,
    @Body() body: { value: Record<string, any> },
  ) {
    return this.historyLogService.send('settings.update', {
      key,
      value: body.value,
    });
  }

  @Patch()
  updateMany(
    @Body() body: { settings: { key: string; value: Record<string, any> }[] },
  ) {
    return this.historyLogService.send('settings.updateMany', {
      settings: body.settings,
    });
  }
}
