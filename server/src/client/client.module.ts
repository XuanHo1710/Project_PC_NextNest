import { Module } from '@nestjs/common';
import { EmployeeModuleClient } from 'src/client/employee/employee.module';
import { ProductModuleClient } from 'src/client/product/product.module';


@Module({
    imports: [
        EmployeeModuleClient,
        ProductModuleClient
    ]
})
export class ClientModule { }
