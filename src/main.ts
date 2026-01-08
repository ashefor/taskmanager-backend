import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SanitizeHtmlPipe } from './common/pipes/sanitize-html.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://propel.molior.dev',
  'http://localhost:8080'
];
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isDevelopment = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDevelopment
      ? allowedOrigins
      : process.env.FRONTEND_URL || 'https://propel.molior.dev',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
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
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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
}
bootstrap();
