import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';

import { Role } from './schemas/role.schema';
import { User } from './schemas/user.schema';
import { ALL_PERMISSIONS } from './config/permissions';
import { HttpExceptionFilter } from './config/common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const frontendUrl = process.env.FRONTEND_URL || 'https://company-site-beryl.vercel.app';
  const port = configService.get<number>('PORT') || 3001;
  
  console.log('frontendUrl',frontendUrl)
  // --- Global middlewares ---
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // --- Seed default roles and admin ---
  await createDefaultRolesAndAdminUser(app);

  // --- Swagger setup ---
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE') || 'Auth Backend API')
    .setDescription(
      configService.get<string>('SWAGGER_DESCRIPTION') ||
        'Backend API with authentication and role-based access',
    )
    .setVersion(configService.get<string>('SWAGGER_VERSION') || '1.0')
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

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'API Documentation',
  });

  // --- Start app ---
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs available at http://localhost:${port}/docs`);
}

async function createDefaultRolesAndAdminUser(app: any) {
  const roleModel = app.get(getModelToken(Role.name));
  const userModel = app.get(getModelToken(User.name));

  // Admin role
  let adminRole = await roleModel.findOne({ name: 'admin' }).exec();
  if (!adminRole) {
    adminRole = new roleModel({ name: 'admin', permissions: ALL_PERMISSIONS });
    await adminRole.save();
    console.log('✅ Admin role created.');
  }

  // User role
  let userRole = await roleModel.findOne({ name: 'user' }).exec();
  if (!userRole) {
    userRole = new roleModel({ name: 'user', permissions: [] });
    await userRole.save();
    console.log('✅ User role created.');
  }

  // Default admin user
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
    console.log('✅ Admin user created.');
  }
}

bootstrap();
