import { Module } from '@nestjs/common';
import { AuthModule } from 'client/auth/auth.module';
import { ProductModule } from 'client/product/product.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, ProductModule, JwtModule.register({})],
})
export class ClientModule {}
