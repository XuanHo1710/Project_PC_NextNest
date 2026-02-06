import type { IAccountEmployee } from "@/types/account-employee";
import { BaseService } from "./base.service";

class AccountEmployeeService extends BaseService<IAccountEmployee> {
  constructor() {
    super("account-employee");
  }
}

export const accountEmployeeService = new AccountEmployeeService();
