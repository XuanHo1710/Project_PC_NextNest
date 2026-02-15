import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductSearchModule } from './product-search/product-search.module';

@Module({
  imports: [ConfigModule.forRoot(), ProductSearchModule],
})
export class AppModule {}
