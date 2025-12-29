import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SanitizeHtmlPipe } from './common/pipes/sanitize-html.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('A comprehensive task management system API with user authentication, task creation, assignment, commenting, and activity tracking.')
    .setVersion('1.0')
    .setContact(
      'Task Manager Support',
      'https://github.com/ashefor/taskmanager-backend',
      'support@taskmanager.com'
    )
    .addTag('auth', 'Authentication endpoints - login, registration, password management')
    .addTag('users', 'User management endpoints')
    .addTag('tasks', 'Task management endpoints - CRUD operations, comments, attachments')
    .addTag('activity-log', 'Activity log and audit trail endpoints')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
