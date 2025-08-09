import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Role } from '../usuarios/entities/rol.enum';

async function bootstrap() {
  const logger = new Logger('InitFirstAdmin');

  const adminUser = process.env.FIRST_ADMIN;
  const adminPass = process.env.PASS_FIRST_ADMIN;

  if (!adminUser || !adminPass) {
    logger.warn(
      'Variables de entorno FIRST_ADMIN y/o PASS_FIRST_ADMIN no definidas. Se omite creación de admin.',
    );
    return;
  }

  // Creamos un contexto de aplicación sin levantar el servidor HTTP
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const authService = appContext.get(AuthService);
  const usuariosService = appContext.get(UsuariosService);

  try {
    // 1) Intentar login; si funciona, el usuario ya existe con esas credenciales
    const loginResult = await authService.login({
      nombre: adminUser,
      password: adminPass,
    });

    if (loginResult?.token) {
      logger.log('Cuenta admin existente. No se requiere acción.');
      return;
    }
  } catch {
    // Ignorar y continuar a verificación/creación
  }

  try {
    // 2) Verificar si existe el usuario por nombre
    await usuariosService.findByNombre(adminUser);
    logger.log(
      `El usuario '${adminUser}' ya existe (contraseña puede ser distinta). No se crea nuevamente.`,
    );
  } catch {
    // 3) No existe → crear usuario admin
    await usuariosService.create({
      nombre: adminUser,
      password: adminPass,
      rol: Role.ADMINISTRADOR,
    });
    logger.log(`Usuario admin '${adminUser}' creado correctamente.`);
  } finally {
    await appContext.close();
  }
}

bootstrap().catch((err) => {
  // En caso de error inesperado, registrar y no romper el proceso de build
  // eslint-disable-next-line no-console
  console.error('Error al inicializar el primer admin:', err?.message || err);
});
