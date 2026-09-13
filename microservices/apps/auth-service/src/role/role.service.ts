import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateRoleDto, UpdateRoleDto } from '@project-pc/common';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleModel.create(createRoleDto);
    return role;
  }

  async findAll(filter: any) {
    // Clamp pagination to sane bounds
    const page = Math.min(Math.max(parseInt(filter.page, 10) || 1, 1), 10000);
    const limit = Math.min(Math.max(parseInt(filter.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const sortRole = {};
    const filterRole = {};

    if (filter.search) {
      const keyword = filter.search;
      filterRole['$or'] = [{ name: { $regex: keyword, $options: 'i' } }];
    }

    if (filter.sort) {
      const keySort = filter.sort.split('_')[0];
      const valueSort = filter.sort.split('_')[1];
      sortRole[keySort] = valueSort === 'asc' ? 1 : -1;
    } else {
      sortRole['createdAt'] = -1;
    }

    if (filter.filter) {
      const keyFilter = filter.filter.split('_')[0];
      const valueFilter = filter.filter.split('_')[1];
      filterRole[keyFilter] = valueFilter;
    }

    const [data, total] = await Promise.all([
      this.roleModel
        .find(filterRole)
        .sort(sortRole)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.roleModel.countDocuments(filterRole),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string) {
    return await this.roleModel.findById(new Types.ObjectId(id));
  }

  async updateMany(dataUpdate: any) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case 'delete': {
        return await this.roleModel.deleteMany({
          _id: { $in: dataUpdate.ids },
        });
      }
    }
    return null;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    console.log('updateRoleDto', updateRoleDto);
    return await this.roleModel.updateOne(
      { _id: new Types.ObjectId(id) },
      updateRoleDto,
    );
  }

  async remove(id: string) {
    return await this.roleModel.deleteOne({ _id: new Types.ObjectId(id) });
  }
}
