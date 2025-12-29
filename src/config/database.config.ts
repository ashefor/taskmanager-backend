import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  // Railway provides MYSQL_URL in production
  const mysqlUrl = configService.get('MYSQL_URL');

  return {
    type: 'mysql',
    url: mysqlUrl,
    // Fallback to individual variables if MYSQL_URL not available
    host: mysqlUrl ? undefined : configService.get('MYSQLHOST', 'localhost'),
    port: mysqlUrl ? undefined : configService.get('MYSQLPORT', 3306),
    username: mysqlUrl ? undefined : configService.get('MYSQLUSER', 'root'),
    password: mysqlUrl ? undefined : configService.get('MYSQLPASSWORD', ''),
    database: mysqlUrl ? undefined : configService.get('MYSQLDATABASE', 'taskmanager'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // NEVER true in production - use migrations
    logging: !isProduction,
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: true, // Auto-run migrations on startup
    ssl: isProduction
      ? {
          rejectUnauthorized: false, // Required for Railway MySQL
        }
      : false,
    timezone: 'Z', // Use UTC
    charset: 'utf8mb4',
  };
};
