import { Module } from '@nestjs/common';
import { CategoryModuleClient } from 'src/client/category/category.module';
import { EmployeeModuleClient } from 'src/client/employee/employee.module';
import { ProductModuleClient } from 'src/client/product/product.module';


@Module({
    imports: [
        EmployeeModuleClient,
        ProductModuleClient,
        CategoryModuleClient
    ]
})
export class ClientModule { }
