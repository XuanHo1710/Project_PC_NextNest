import { Module } from '@nestjs/common';
import { AuthModule } from 'client/auth/auth.module';
import { ProductModule } from 'client/product/product.module';

@Module({
  imports: [AuthModule, ProductModule],
})
export class ClientModule {}
