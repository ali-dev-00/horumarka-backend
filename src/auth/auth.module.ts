import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionService } from './session.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Role, RoleSchema } from '../schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour default TTL
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',  
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, SessionService],
  controllers: [AuthController],
  exports: [SessionService],
})
export class AuthModule {}
