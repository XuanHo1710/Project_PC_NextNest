import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateAccountEmployeeDto } from './dto/create-account-employee.dto';
import { UpdateAccountEmployeeDto } from './dto/update-account-employee.dto';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountEmployee } from 'src/account-employee/entities/account-employee.entity';

const bcrypt = require('bcrypt');
const saltRounds = 10;

@Injectable()
export class AccountEmployeeService {
  constructor(
    @InjectModel(AccountEmployee.name)
    private accountEmployeeModel: Model<AccountEmployee>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(createAccountEmployeeDto: CreateAccountEmployeeDto) {
    createAccountEmployeeDto.employee = createAccountEmployeeDto.employeeId;

    // Hash password
    const hashPassword = bcrypt.hashSync(
      createAccountEmployeeDto.password,
      saltRounds,
    );
    createAccountEmployeeDto.password = hashPassword;

    const account = await this.accountEmployeeModel.create(
      createAccountEmployeeDto,
    );
    return account;
  }

  async findAll(filter: any) {
    const sortAccount = {};

    const filterAccount = {};

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
      .find(filterAccount)
      .sort(sortAccount)
      .populate(['employee']);
    return accounts;
  }

  async findAccountByIDEmp(IDEmp: string): Promise<AccountEmployee | null> {
    return await this.accountEmployeeModel.findOne({ IDEmp: IDEmp });
  }

  async findEmployeeByToken(token: string) {
    const detailPayload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
    const account = (await this.accountEmployeeModel.findOne({
      IDEmp: detailPayload.IDEmp,
    })) as AccountEmployee | null;
    if (account) {
      return {
        ...detailPayload,
        access_token: account.accessToken,
      };
    } else throw new BadGatewayException('Not found account');
  }

  async updateAccountEmployeeToken(token: string, expire: number, id: string) {
    const update = await this.accountEmployeeModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { accessToken: token, expireToken: expire },
    );
    return update;
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
    updateAccountEmployeeDto.employee = updateAccountEmployeeDto.employeeId;

    // Hash password
    if (updateAccountEmployeeDto.password) {
      const hashPassword = bcrypt.hashSync(
        updateAccountEmployeeDto.password,
        saltRounds,
      );
      updateAccountEmployeeDto.password = hashPassword;
    }

    return await this.accountEmployeeModel.updateOne(
      { _id: id },
      updateAccountEmployeeDto,
    );
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.accountEmployeeModel.deleteOne({ _id: id });
  }
}
