import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "src/modules/users/user.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME ?? 'taskmanager',
    entities: [User],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true
}