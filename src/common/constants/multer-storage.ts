import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    // const uploadPath = './uploads/attachments';
     const uploadPath = join(process.cwd(), 'src', 'uploads', 'attachments');

    // ✅ ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + extname(file.originalname));
  },
});
