import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
      dismissDefaultMessages: false,
    }),
  );

  // API prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Hospital Management API')
      .setDescription('Comprehensive Hospital & Clinic Management SaaS Platform API')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('patients', 'Patient management')
      .addTag('appointments', 'Appointment scheduling')
      .addTag('medical-records', 'Medical records and EMR')
      .addTag('pharmacy', 'Pharmacy management')
      .addTag('laboratory', 'Laboratory information system')
      .addTag('billing', 'Billing and payments')
      .addTag('telemedicine', 'Telemedicine consultations')
      .addTag('admin', 'Administrative functions')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'tenant')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Get port from environment
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`🏥 Hospital Management API is running on: ${await app.getUrl()}`);
  console.log(`📚 API Documentation: ${await app.getUrl()}/${apiPrefix}/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});