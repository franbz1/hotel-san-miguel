
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import notFoundError from 'src/common/errors/notfoundError';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';
import { ReservasService } from 'src/reservas/reservas.service';
import { FormulariosService } from 'src/formularios/formularios.service';
import { FacturasService } from 'src/facturas/facturas.service';
import { ApiProperty } from '@nestjs/swagger';
import { LinkFormulario } from '@prisma/client';

/**
 * Service para manejar la eliminación de reservas
 */
@Injectable()
export class EliminarBookingService {
    constructor(private readonly prisma: PrismaService,
        private readonly linkFormularioService: LinkFormularioService,
        private readonly reservaService: ReservasService,
        private readonly formulariosService: FormulariosService,
        private readonly facturasService: FacturasService) { }

    /**
     * Elimina (soft delete) una reserva por su ID.
     * @param id ID de la reserva.
     * @returns La reserva eliminada.
     * @throws NotFoundException si la reserva no existe.
     */
    /**
     * Elimina un booking completo (link de formulario, formulario, reserva y factura) por su ID.
     * Todas las operaciones se realizan dentro de una transacción para garantizar la integridad de los datos.
     * @param id ID del booking (link de formulario).
     * @throws NotFoundException si el booking no existe.
     */
    async remove(id: number): Promise<RemoveBookingResponse | LinkFormulario> {
        try {
            // Primero obtenemos todos los datos necesarios
            const linkFormulario = await this.linkFormularioService.findOne(id);
            if (linkFormulario.completado) {
                const formulario = await this.formulariosService.findOne(linkFormulario.formularioId);
                const reserva = await this.reservaService.findOne(formulario.reservaId);

                // Ejecutamos todas las operaciones dentro de una transacción
                return await this.prisma.$transaction(async (tx) => {
                    // Si la reserva tiene una factura, la eliminamos primero
                    if (reserva.facturaId) {
                        await this.facturasService.removeTx(reserva.facturaId, tx);
                    }

                    // Eliminamos el formulario
                    await this.formulariosService.removeTx(formulario.id, tx);

                    // Eliminamos la reserva
                    await this.reservaService.removeTx(reserva.id, tx);

                    // Eliminamos el link del formulario
                    await this.linkFormularioService.removeTx(linkFormulario.id, tx);

                    // Retornamos los datos del booking eliminado para confirmación
                    return {
                        message: 'Booking eliminado correctamente',
                        data: {
                            linkFormularioId: linkFormulario.id,
                            formularioId: formulario.id,
                            reservaId: reserva.id,
                            facturaId: reserva.facturaId
                        }
                    };
                });
            } else {
                return await this.linkFormularioService.remove(id);
            }
        } catch (error) {
            if (error.code === 'P2025') throw notFoundError(id);
            throw error;
        }
    }
}

// Class para datos de respuesta de booking eliminado
export class RemoveBookingResponseData {
    @ApiProperty({ description: 'ID del link de formulario eliminado' })
    linkFormularioId: number;

    @ApiProperty({ description: 'ID del formulario eliminado' })
    formularioId: number;

    @ApiProperty({ description: 'ID de la reserva eliminada' })
    reservaId: number;

    @ApiProperty({ description: 'ID de la factura eliminada (si existe)' })
    facturaId: number;
}

// Class principal para la respuesta de eliminación de booking
export class RemoveBookingResponse {
    @ApiProperty({ description: 'Mensaje de confirmación' })
    message: string;

    @ApiProperty({ description: 'Datos del booking eliminado', type: RemoveBookingResponseData })
    data: RemoveBookingResponseData;
}
