import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'charity' },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result);
          return reject(new Error('No result returned from Cloudinary'));
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }
}
