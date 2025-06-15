import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Employee } from './entities/employee.entity';
import mongoose, { Model } from 'mongoose';
import { TypeQueryEmployee, TypeUpdateManyEmployee } from 'types/employee';

@Injectable()
export class EmployeeService {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<Employee>) { }



  async create(createEmployeeDto: CreateEmployeeDto) {
    const existingUser = await this.employeeModel.findOne({ email: createEmployeeDto.email });
    if (existingUser) {
      throw new BadRequestException("Email đã tồn tại. Vui lòng chọn email khác.");
    }
    const employee = await this.employeeModel.create(createEmployeeDto)
    return employee;
  }

  async findAll(filter: TypeQueryEmployee) {

    const sortEmployee = {};

    const filterEmployee = {};

    if (filter.search) {
      const keyword = filter.search;
      filterEmployee["$or"] = [
        { name: { $regex: keyword, $options: "i" } },   // tìm trong tên
        { email: { $regex: keyword, $options: "i" } }   // tìm trong email
      ];
    }


    if (filter.sort) {
      const keySort = filter.sort.split("_")[0];
      const valueSort = filter.sort.split("_")[1];
      sortEmployee[keySort] = valueSort;
    }

    if (filter.filter) {
      const keySort = filter.filter.split("_")[0];
      const valueSort = filter.filter.split("_")[1];
      filterEmployee[keySort] = valueSort;
    }


    const employees = await this.employeeModel.find(filterEmployee).sort(sortEmployee);
    return employees;
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

  async update(id: mongoose.Types.ObjectId, updateEmployeeDto: UpdateEmployeeDto) {
    return await this.employeeModel.updateOne({ _id: id }, updateEmployeeDto);
  }

  async updateMany(dataUpdate: TypeUpdateManyEmployee) {
    const type = dataUpdate.typeUpdate.split(':')[0];
    switch (type) {
      case "delete": {
        return await this.employeeModel.deleteMany({ _id: { $in: dataUpdate.ids } });
      }
      case "update": {
        const keyUpdate = dataUpdate.typeUpdate.split(":")[1].split("_")[0];
        const valueUpdate = dataUpdate.typeUpdate.split(":")[1].split("_")[1];

        const update = {
        };

        update[keyUpdate] = valueUpdate;
        return await this.employeeModel.updateMany({ _id: { $in: dataUpdate.ids } }, update);
      }
    }
    return null;
  }

  async remove(id: mongoose.Types.ObjectId) {
    return await this.employeeModel.deleteOne({ _id: id });
  }
}
