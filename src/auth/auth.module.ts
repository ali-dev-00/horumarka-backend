import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionService } from './session.service';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsGuard } from './permissions.guard';
import { AuthGuard } from './auth.guard';
import { User, UserSchema } from '../schemas/user.schema';
import { Role, RoleSchema } from '../schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    PassportModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour default TTL
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, SessionService, JwtStrategy, PermissionsGuard, AuthGuard],
  controllers: [AuthController],
  exports: [SessionService, PermissionsGuard, AuthGuard],
})
export class AuthModule {}
