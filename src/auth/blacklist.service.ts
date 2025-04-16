import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class BlacklistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica si un token está en la lista negra.
   * @param token - Token a verificar
   * @returns boolean indicando si el token está en la lista negra
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
        where: { token },
      });
      return !!blacklistedToken;
    } catch (error) {
      throw new BadRequestException(
        'Error al verificar el token en la lista negra',
      );
    }
  }

  /**
   * Agrega un token a la lista negra.
   * @param token - Token a agregar
   */
  async addToBlacklist(token: string): Promise<void> {
    try {
      await this.prisma.tokenBlacklist.create({
        data: { token },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('El token ya está en la lista negra');
      }
      throw new BadRequestException(
        'Error al agregar el token a la lista negra',
      );
    }
  }
}
