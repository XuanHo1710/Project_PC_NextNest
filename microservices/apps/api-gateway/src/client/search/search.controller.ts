import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE } from '@project-pc/common';
import { Public } from '../../decorators/customize';

@Controller('/client/search')
export class SearchController {
  constructor(
    @Inject(MICROSERVICE.ELASTICSEARCH_SERVICE)
    private readonly esService: ClientProxy,
  ) {}

  /**
   * Full search with pagination
   * GET /api/v1/client/search?q=ram 16gb&page=1&limit=20&sort=displayPrice_1
   */
  @Get()
  @Public()
  searchProducts(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ) {
    return this.esService.send('es.search.productVariants', {
      q: q || '',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      category,
      brand,
    });
  }

  /**
   * Quick search (autocomplete/instant)
   * GET /api/v1/client/search/quick?q=laptop&limit=10
   */
  @Get('quick')
  @Public()
  quickSearch(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.esService.send('es.search.quick', {
      q: q || '',
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }
}
