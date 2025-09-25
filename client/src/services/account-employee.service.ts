import type { IAccountEmployee } from "@/types/modal.d"
import { BaseService } from "./base.service"

class AccountEmployeeService extends BaseService<IAccountEmployee> {
  constructor() {
    super("account-employee")
  }
}

export const accountEmployeeService = new AccountEmployeeService()
