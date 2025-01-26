import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class FormularioService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(
    tx: Prisma.TransactionClient,
    huespedId: number,
    reservaId: number,
  ) {
    try {
      return await tx.formulario.create({
        data: {
          huespedId,
          reservaId,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
