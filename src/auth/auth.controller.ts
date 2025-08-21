import { Body, Controller, Post, UseGuards, Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { AuthGuard } from './guards/auth.guard';
import { Throttle } from '@nestjs/throttler';

/**
 * Controlador de autenticación
 * Agrupa las rutas bajo el tag "auth" en la documentación de Swagger
 */
@Throttle({ default: { limit: 15, ttl: 60000 } })
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ================================================================
  // LOGIN - Autenticar usuario
  // ================================================================
  /**
   * Método para autenticar a un usuario
   * `POST /auth/login`
   *
   * @param loginDto - Objeto con las credenciales de autenticación
   * @returns Token de autenticación o datos del usuario autenticado
   */
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuario' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado correctamente',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token JWT de autenticación',
        },
        usuarioId: {
          type: 'number',
          description: 'ID del usuario',
        },
        nombre: {
          type: 'string',
          description: 'Nombre del usuario',
        },
        rol: {
          type: 'string',
          description: 'Rol del usuario',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error al procesar el login',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ================================================================
  // LOGOUT - Cerrar sesión del usuario
  // ================================================================
  /**
   * Método para cerrar la sesión de un usuario autenticado
   * `POST /auth/logout`
   *
   * @param authorization - Token JWT en formato Bearer
   * @returns Mensaje de éxito al cerrar sesión
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión del usuario' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT en formato Bearer',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada correctamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Mensaje de éxito',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  logout(@Headers('authorization') auth: string) {
    return this.authService.logout(auth);
  }

  // ================================================================
  // VALIDATE - Validar token JWT
  // ================================================================
  /**
   * Método para validar un token JWT
   * `POST /auth/validate`
   *
   * @param authorization - Token JWT en formato Bearer
   * @returns Objeto con el estado de validación del token y la información del usuario
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Token JWT en formato Bearer',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        isValid: {
          type: 'boolean',
          description: 'Indica si el token es válido',
        },
        usuarioId: {
          type: 'number',
          description: 'ID del usuario',
        },
        nombre: {
          type: 'string',
          description: 'Nombre del usuario',
        },
        rol: {
          type: 'string',
          description: 'Rol del usuario',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  validateToken(@Headers('authorization') auth: string) {
    return this.authService.validateToken(auth);
  }
}
