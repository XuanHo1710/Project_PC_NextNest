// services/role.service.ts
import type { IRole } from "@/types/role";
import { BaseService } from "./base.service";

class RoleService extends BaseService<IRole> {
  constructor() {
    super("role");
  }
}

export const roleService = new RoleService();
