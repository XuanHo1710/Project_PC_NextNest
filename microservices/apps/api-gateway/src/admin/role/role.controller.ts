import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { CreateRoleDto, MICROSERVICE, UpdateRoleDto } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('/admin/role')
export class RoleController {
  constructor(
    @Inject(MICROSERVICE.AUTH_SERVICE)
    private readonly roleService: ClientProxy,
  ) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.send('role.create', {
      createRoleDto: createRoleDto,
    });
  }

  @Get()
  findAll(@Query() filter: any) {
    return this.roleService.send('role.findAll', { filter: filter });
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: any) {
    return this.roleService.send('role.updateMany', { dataUpdate: dataUpdate });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log("CALLED", id)
    return this.roleService.send('role.findOne', { id: id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.send('role.update', {
      id: id,
      updateRoleDto: updateRoleDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.send('role.remove', { id: id });
  }
}
