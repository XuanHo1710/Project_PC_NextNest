// services/employee.service.ts
import axios from "@/config/axios"
import type { IEmployee } from "@/types/modal.d"
import { BaseService } from "./base.service"

class EmployeeService extends BaseService<IEmployee> {
  constructor() {
    super("employee")
  }

  async getEmployeesNoAccount(): Promise<IEmployee[]> {
    const response = await axios.get(`${this.baseUrl}/no-account`)
    return response.data
  }
}

export const employeeService = new EmployeeService()
