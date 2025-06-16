import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TypeQueryRole, TypeUpdateManyRole } from 'types/role';
import mongoose from 'mongoose';

@Controller('/admin/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() filter: TypeQueryRole) {
    return this.roleService.findAll(filter);
  }

  @Patch('/updateMany')
  updateMany(@Body() dataUpdate: TypeUpdateManyRole) {
    return this.roleService.updateMany(dataUpdate);
  }

  @Get(':id')
  findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: mongoose.Types.ObjectId, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.roleService.remove(id);
  }
}
