import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { envs } from './config/envs';
import { UsuariosService } from './usuarios/usuarios.service';
import { Role } from './usuarios/entities/rol.enum';

async function bootstrap() {
  process.env.TZ = 'UTC';

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('App');

  // Crear el primer admin
  const adminService = app.get(UsuariosService);
  const adminName = envs.firstAdmin;
  const adminPassword = envs.passFirstAdmin;

  try {
    await adminService.findByNombre(adminName);
  } catch {
    await adminService.create({
      nombre: adminName,
      password: adminPassword,
      rol: Role.ADMINISTRADOR,
    });
  }

  // Aplicar pipes globales para validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: envs.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
  });

  if (envs.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Hotel San Miguel API')
      .setDescription('Documentación de la API del Hotel San Miguel')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(envs.port);
  logger.log(`Application is running on: ${envs.port}`);
  logger.log(`Timezone: ${process.env.TZ}`);
}
bootstrap();
