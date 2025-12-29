import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export default new DataSource({
  type: 'mysql',
  url: process.env.MYSQL_URL,
  host: process.env.MYSQL_URL ? undefined : process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQL_URL ? undefined : parseInt(process.env.MYSQLPORT || '3306'),
  username: process.env.MYSQL_URL ? undefined : process.env.MYSQLUSER || 'root',
  password: process.env.MYSQL_URL ? undefined : process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQL_URL ? undefined : process.env.MYSQLDATABASE || 'taskmanager',
  entities: ['./src/**/*.entity{.ts,.js}'],
  migrations: ['./src/migrations/*{.ts,.js}'],
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});
