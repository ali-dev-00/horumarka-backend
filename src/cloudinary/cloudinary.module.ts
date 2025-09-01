import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadService } from './upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryProvider, UploadService],
  exports: [CloudinaryProvider, UploadService], // Export so other modules can use it
})
export class CloudinaryModule {}
