import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';
import { ContentManagement, ContentManagementSchema } from '../schemas/content-management.schema';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentManagement.name, schema: ContentManagementSchema }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ContentManagementController],
  providers: [ContentManagementService, AuthGuard, PermissionsGuard],
  exports: [ContentManagementService],
})
export class ContentManagementModule {}
