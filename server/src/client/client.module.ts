import { Module } from '@nestjs/common';
import { CategoryModuleClient } from 'src/client/category/category.module';
import { EmployeeModuleClient } from 'src/client/employee/employee.module';
import { ProductModuleClient } from 'src/client/product/product.module';
import { PaymentModule } from 'src/client/payment/payment.module';
import { ClientAuthModule } from 'src/client/auth/auth.module';
import { GuestModule } from 'src/client/guest/guest.module';


@Module({
    imports: [
        EmployeeModuleClient,
        ProductModuleClient,
        CategoryModuleClient,
        PaymentModule,
        ClientAuthModule,
        GuestModule,
    ]
})
export class ClientModule { }
