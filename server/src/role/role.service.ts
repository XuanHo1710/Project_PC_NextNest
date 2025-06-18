import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/role/entities/role.entity';
import mongoose, { Model } from 'mongoose';
import { TypeQueryRole, TypeUpdateManyRole } from 'types/role';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) { }

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleModel.create(createRoleDto)
    return role;
  }

  async findAll(filter: TypeQueryRole) {
    const sortRole = {};

    const filterRole = {};

    if (filter.search) {
      const keyword = filter.search;
      filterRole["$or"] = [
        { name: { $regex: keyword, $options: "i" } }   // tìm trong name
      ];
    }


    if (filter.sort) {
      const keySort = filter.sort.split("_")[0];
      const valueSort = filter.sort.split("_")[1];
      sortRole[keySort] = valueSort;
    }

    if (filter.filter) {
      const keySort = filter.filter.split("_")[0];
      const valueSort = filter.filter.split("_")[1];
      filterRole[keySort] = valueSort;
    }


    const roles = await this.roleModel.find(filterRole).sort(sortRole);
    return roles;
  }

  async findOne(id: mongoose.Types.ObjectId) {
    return await this.roleModel.findById(id);
  }

  async updateMany(dataUpdate: TypeUpdateManyRole) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case "delete": {
        return await this.roleModel.deleteMany({ _id: { $in: dataUpdate.ids } });
      }
    }
    return null;
  }

  async update(id: mongoose.Types.ObjectId, updateRoleDto: UpdateRoleDto) {
    return await this.roleModel.updateOne({ _id: id }, updateRoleDto);
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.roleModel.deleteOne({ _id: id });
  }
}
