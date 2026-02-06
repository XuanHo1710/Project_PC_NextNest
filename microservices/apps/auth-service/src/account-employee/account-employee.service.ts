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
    const sortAccount = {};

    const filterAccount = {
      isDeleted: false
    };

    if (filter.search) {
      const keyword = filter.search;
      filterAccount['$or'] = [
        { IDEmp: { $regex: keyword, $options: 'i' } }, // tìm trong email
      ];
    }

    if (filter.sort) {
      const keySort = filter.sort.split('_')[0];
      const valueSort = filter.sort.split('_')[1];
      sortAccount[keySort] = valueSort;
    }

    if (filter.filter) {
      const keySort = filter.filter.split('_')[0];
      const valueSort = filter.filter.split('_')[1];
      filterAccount[keySort] = valueSort;
    }

    const accounts = await this.accountEmployeeModel
      .find(filterAccount, { password: 0 })
      .sort(sortAccount)
      .populate('roleId', 'name');

    return accounts;
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
