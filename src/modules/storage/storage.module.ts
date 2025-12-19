import { Module } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MulterModule } from '@nestjs/platform-express';
@Module({
    imports: [
        MulterModule.registerAsync({
            useFactory: () => ({
                dest: '../uploads/items',
                storage: diskStorage({
                    destination: '../uploads/items',
                    filename: (req, file, cb) => {
                        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, uniqueName + extname(file.originalname));
                    },
                }),
            })
        }),
    ]
})
export class StorageModule { }
