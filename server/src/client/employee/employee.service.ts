import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccountEmployee } from 'src/admin/account-employee/entities/account-employee.entity';
import { Employee } from 'src/admin/employee/entities/employee.entity';
import mongoose, { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(AccountEmployee.name) private accountEmployeeModel: Model<AccountEmployee>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async findAll() {
    // Generate cache key
    const cacheKey = 'employees:all';

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }


    const employees = await this.employeeModel.find({});

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, employees, 3600000);

    return employees;
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`;
  }

}
