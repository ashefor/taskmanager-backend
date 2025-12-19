import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SanitizeHtmlPipe } from './common/pipes/sanitize-html.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips out properties not in DTO
      forbidNonWhitelisted: true, // throws error if unknown fields are sent
      transform: true, // automatically transforms payloads to DTO instances
    }),
    new SanitizeHtmlPipe(),
  );

  // app.use(cookieParser());
  app.use(helmet());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
