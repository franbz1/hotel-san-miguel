import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto';
import { AuthGuard } from './guards/auth.guard';

/**
 * Controlador de autenticación
 * Agrupa las rutas bajo el tag "auth" en la documentación de Swagger
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Método para autenticar a un usuario
   * `POST /auth/login`
   *
   * @param loginDto - Objeto con las credenciales de autenticación
   * @returns Token de autenticación o datos del usuario autenticado
   */
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuario' }) // Resumen de la operación
  @ApiBody({ type: LoginDto }) // Describe el cuerpo de la solicitud (DTO)
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Método para cerrar la sesión de un usuario autenticado
   * `POST /auth/logout`
   *
   * @returns Mensaje de éxito o estado de cierre de sesión
   */
  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión del usuario' }) // Resumen de la operación
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada correctamente',
  })
  logout() {
    return this.authService.logout();
  }
}
