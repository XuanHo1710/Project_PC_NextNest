import { BadGatewayException, Injectable } from '@nestjs/common';
import {
  CreateAccountEmployeeDto,
  UpdateAccountEmployeeDto,
} from '@project-pc/common';

import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AccountEmployee } from 'src/account-employee/entities/account-employee.entity';

const bcrypt = require('bcrypt');
const saltRounds = 10;

@Injectable()
export class AccountEmployeeService {
  constructor(
    @InjectModel(AccountEmployee.name)
    private accountEmployeeModel: Model<AccountEmployee>,
  ) { }

  async create(createAccountEmployeeDto: CreateAccountEmployeeDto) {
    // Hash password
    const hashPassword = bcrypt.hashSync(
      createAccountEmployeeDto.password,
      saltRounds,
    );
    createAccountEmployeeDto.password = hashPassword;

    const existingAccount = await this.accountEmployeeModel.findOne({
      $or: [
        { IDEmp: createAccountEmployeeDto.IDEmp },
        { email: createAccountEmployeeDto.email },
      ],
    });

    if (existingAccount) {
      throw new BadGatewayException('Nhân viên đã tồn tại');
    }

    const payload = {
      ...createAccountEmployeeDto,
      roleId: new Types.ObjectId(createAccountEmployeeDto.roleId),
    };

    const account = new this.accountEmployeeModel(payload);
    return account.save();
  }

  async findAll(filter: any) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const sortAccount = {};

    const filterAccount = {
      isDeleted: false
    };

    if (filter.search) {
      const keyword = filter.search;
      filterAccount['$or'] = [
        { IDEmp: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (filter.sort) {
      const keySort = filter.sort.split('_')[0];
      const valueSort = filter.sort.split('_')[1];
      sortAccount[keySort] = valueSort === 'asc' ? 1 : -1;
    } else {
      // Default sort
      sortAccount['createdAt'] = -1;
    }

    if (filter.filter) {
      const keyFilter = filter.filter.split('_')[0];
      const valueFilter = filter.filter.split('_')[1];
      if (keyFilter === 'roleId') {
        filterAccount[keyFilter] = new Types.ObjectId(valueFilter);
      } else {
        filterAccount[keyFilter] = valueFilter;
      }
    }

    const [data, total] = await Promise.all([
      this.accountEmployeeModel
        .find(filterAccount, { password: 0 })
        .populate('roleId', 'name')
        .sort(sortAccount)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.accountEmployeeModel.countDocuments(filterAccount),
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

  async findAccountByIDEmp(IDEmp: string): Promise<AccountEmployee | null> {
    return await this.accountEmployeeModel.findOne({ IDEmp: IDEmp });
  }

  async findOne(id: string) {
    return await this.accountEmployeeModel.findById(id);
  }

  async updateMany(dataUpdate: any) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case 'delete': {
        return await this.accountEmployeeModel.deleteMany({
          _id: { $in: dataUpdate.ids },
        });
      }
      case 'update': {
        const keyUpdate = dataUpdate.typeUpdate.split(':')[1].split('_')[0];
        const valueUpdate = dataUpdate.typeUpdate.split(':')[1].split('_')[1];

        const update = {};

        update[keyUpdate] = valueUpdate;
        return await this.accountEmployeeModel.updateMany(
          { _id: { $in: dataUpdate.ids } },
          update,
        );
      }
    }
    return null;
  }

  async update(
    id: mongoose.Types.ObjectId,
    updateAccountEmployeeDto: UpdateAccountEmployeeDto,
  ) {
    // Hash password
    if (updateAccountEmployeeDto.password) {
      const hashPassword = bcrypt.hashSync(
        updateAccountEmployeeDto.password,
        saltRounds,
      );
      updateAccountEmployeeDto.password = hashPassword;
    }

    const payload = {
      ...updateAccountEmployeeDto,
      roleId: new Types.ObjectId(updateAccountEmployeeDto.roleId),
    };

    return await this.accountEmployeeModel.updateOne({ _id: id }, payload);
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.accountEmployeeModel.deleteOne({ _id: id });
  }
}
