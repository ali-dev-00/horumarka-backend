import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Role } from './schemas/role.schema';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { ALL_PERMISSIONS } from './config/permissions';
import { AuthGuard } from './auth/auth.guard';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure roles are created on startup
  await createDefaultRolesAndAdminUser(app);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Apply global auth guard AFTER app is configured
  const authGuard = app.get(AuthGuard);
  app.useGlobalGuards(authGuard);

  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Auth Backend API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'Backend API with authentication and role-based access')
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token (without Bearer prefix)',
        name: 'Authorization',
        in: 'header',
      },
      'JWT',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Add global security requirement
  if (!document.components) {
    document.components = {};
  }
  document.components.securitySchemes = {
    JWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  };
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { 
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'API Documentation',
  });

  const port = process.env.PORT || 30001; 
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

async function createDefaultRolesAndAdminUser(app: any) {
  const roleModel = app.get(getModelToken(Role.name));
  const userModel = app.get(getModelToken(User.name));

  let adminRole = await roleModel.findOne({ name: 'admin' }).exec();
  if (!adminRole) {
    adminRole = new roleModel({
      name: 'admin',
      permissions: ALL_PERMISSIONS,
    });
    await adminRole.save();
    console.log('Admin role created.');
  }

  let userRole = await roleModel.findOne({ name: 'user' }).exec();
  if (!userRole) {
    userRole = new roleModel({
      name: 'user',
      permissions: [], 
    });
    await userRole.save();
    console.log('User role created.');
  }

  let adminUser = await userModel.findOne({ email: 'admin@gmail.com' }).exec();
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin@123', 10); 
    adminUser = new userModel({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      roleId: adminRole._id,
    });
    await adminUser.save();
    console.log('Admin user created.');
  }
}

bootstrap();
