import { Module } from '@nestjs/common';
import { SagaModule } from './saga/saga.module';

@Module({
  imports: [SagaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
