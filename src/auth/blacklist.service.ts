import { Injectable } from '@nestjs/common';
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
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }

  /**
   * Agrega un token a la lista negra.
   * @param token - Token a agregar
   */
  async addToBlacklist(token: string): Promise<void> {
    await this.prisma.tokenBlacklist.create({
      data: { token },
    });
  }
}
