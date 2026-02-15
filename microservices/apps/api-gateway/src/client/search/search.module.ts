import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICE_PORT } from '@project-pc/common';
import { SearchController } from 'client/search/search.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.ELASTICSEARCH_SERVICE,
        transport: Transport.TCP,
        options: {
          port: MICROSERVICE_PORT.ELASTICSEARCH_SERVICE,
        },
      },
    ]),
  ],
  controllers: [SearchController],
})
export class SearchModule {}
