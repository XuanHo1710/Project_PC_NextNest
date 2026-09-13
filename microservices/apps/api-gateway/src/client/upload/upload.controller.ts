import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Guest } from '../../decorators/customize';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.mp4',
  '.webm',
  '.mov',
]);

const imageVideoStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    let ext = extname(file.originalname).toLowerCase();
    // Never trust the client-provided name; fall back to the verified mimetype
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      const mimeExt = (file.mimetype || '').split('/')[1];
      ext = `.${mimeExt === 'quicktime' ? 'mov' : mimeExt || 'bin'}`;
    }
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  const ext = extname(file.originalname).toLowerCase();
  if (!allowedMimes.includes(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    cb(
      new BadRequestException(
        `File type ${file.mimetype} (${ext || 'no extension'}) is not allowed. Allowed: jpg, png, gif, webp, mp4, webm, mov`,
      ),
      false,
    );
    return;
  }

  cb(null, true);
};

@Controller('/client/upload')
export class UploadController {
  /**
   * POST /client/upload/media
   * Upload multiple images/videos (max 10 files, 20MB each)
   * Returns array of URLs
   */
  @Post('media')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: imageVideoStorage,
      fileFilter,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Guest() _guest: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    return { urls };
  }
}
