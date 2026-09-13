import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './core/exception.filter';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

function sanitizeValueInPlace(value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      if (item && typeof item === 'object') {
        sanitizeValueInPlace(item);
      }
    }
    return;
  }
  if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      // Block Mongo operator injection ($gt, $where, ...) and dotted-path keys
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeValueInPlace(obj[key]);
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // Strip Mongo operator injection attempts from query params
  // NOTE: Express 5 exposes `req.query` as getter-only — mutate in place, never reassign.
  app.use((req: any, _res: unknown, next: () => void) => {
    if (req.query && typeof req.query === 'object') {
      sanitizeValueInPlace(req.query);
    }
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      sanitizeValueInPlace(req.body);
    }
    next();
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Product PC API')
      .setDescription('The product PC API description')
      .setVersion('1.0')
      .addTag('product')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory);
  }

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const clientOrigin =
    configService.get<string>('CLIENT_URL') || 'http://localhost:3000';

  // Config CORS
  app.enableCors({
    origin: [clientOrigin, 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { exposeUnsetFields: false },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  //Cookies
  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  await app.listen(configService.get('PORT') as string);
}
bootstrap();
