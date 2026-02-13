import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @MessagePattern('settings.getAll')
  findAll() {
    return this.settingsService.findAll();
  }

  @MessagePattern('settings.getByKey')
  findByKey(@Payload() data: { key: string }) {
    return this.settingsService.findByKey(data.key);
  }

  @MessagePattern('settings.getByGroup')
  findByGroup(@Payload() data: { group: string }) {
    return this.settingsService.findByGroup(data.group);
  }

  @MessagePattern('settings.update')
  update(@Payload() data: { key: string; value: Record<string, any> }) {
    return this.settingsService.update(data.key, data.value);
  }

  @MessagePattern('settings.updateMany')
  updateMany(
    @Payload()
    data: {
      settings: { key: string; value: Record<string, any> }[];
    },
  ) {
    return this.settingsService.updateMany(data.settings);
  }
}
