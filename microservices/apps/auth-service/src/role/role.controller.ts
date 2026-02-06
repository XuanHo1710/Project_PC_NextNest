import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import mongoose from 'mongoose';
import { CreateRoleDto, UpdateRoleDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('/admin/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @MessagePattern('role.create')
  create(@Payload() data: { createRoleDto: CreateRoleDto }) {
    return this.roleService.create(data.createRoleDto);
  }

  @MessagePattern('role.findAll')
  findAll(@Payload() data: { filter: any }) {
    return this.roleService.findAll(data.filter);
  }

  @MessagePattern('role.updateMany')
  updateMany(@Payload() data: { dataUpdate: any }) {
    return this.roleService.updateMany(data.dataUpdate);
  }

  @MessagePattern('role.findOne')
  findOne(@Payload() data: { id: string }) {
    return this.roleService.findOne(data.id);
  }

  @MessagePattern('role.update')
  update(
    @Payload()
    data: {
      id: string;
      updateRoleDto: UpdateRoleDto;
    },
  ) {
    return this.roleService.update(data.id, data.updateRoleDto);
  }

  @MessagePattern('role.remove')
  remove(@Payload() data: { id: string }) {
    return this.roleService.remove(data.id);
  }
}
