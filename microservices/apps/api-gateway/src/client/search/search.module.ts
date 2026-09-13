import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE, getServiceHost, getServicePort } from '@project-pc/common';
import { SearchController } from 'client/search/search.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE.ELASTICSEARCH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: getServiceHost(MICROSERVICE.ELASTICSEARCH_SERVICE),
          port: getServicePort(MICROSERVICE.ELASTICSEARCH_SERVICE),
        },
      },
    ]),
  ],
  controllers: [SearchController],
})
export class SearchModule {}
