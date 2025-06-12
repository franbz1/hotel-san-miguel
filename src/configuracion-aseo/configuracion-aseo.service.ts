import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateConfiguracionAseoDto } from './dto/update-configuracion-aseo.dto';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * Service para manejar la configuración del módulo de aseo
 */
@Injectable()
export class ConfiguracionAseoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración de aseo actual.
   * Si no existe ninguna configuración, crea una por defecto.
   * @returns La configuración de aseo actual.
   */
  async obtenerConfiguracion() {
    try {
      // Buscar la configuración más reciente
      let configuracion = await this.prisma.configuracionAseo.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      // Si no existe configuración, crear una por defecto
      if (!configuracion) {
        configuracion = await this.prisma.configuracionAseo.create({
          data: {
            hora_limite_aseo: '17:00',
            frecuencia_rotacion_colchones: 180,
            dias_aviso_rotacion_colchones: 5,
            habilitar_notificaciones: false,
            elementos_aseo_default: [],
            elementos_proteccion_default: [],
            productos_quimicos_default: [],
            areas_intervenir_habitacion_default: [],
            areas_intervenir_banio_default: [],
          },
        });
      }

      return configuracion;
    } catch (error) {
      throw new BadRequestException('Error al obtener configuración de aseo');
    }
  }

  /**
   * Actualiza la configuración de aseo.
   * Si no existe ninguna configuración, crea una nueva con los datos proporcionados.
   * @param updateConfiguracionAseoDto Datos para actualizar la configuración.
   * @returns La configuración de aseo actualizada.
   */
  async actualizarConfiguracion(
    updateConfiguracionAseoDto: UpdateConfiguracionAseoDto,
  ) {
    try {
      // Buscar si existe una configuración
      const configuracionExistente =
        await this.prisma.configuracionAseo.findFirst({
          select: { id: true },
          orderBy: { createdAt: 'desc' },
        });

      if (configuracionExistente) {
        // Actualizar la configuración existente
        return await this.prisma.configuracionAseo.update({
          where: { id: configuracionExistente.id },
          data: updateConfiguracionAseoDto,
        });
      } else {
        // Crear nueva configuración con valores por defecto y los datos proporcionados
        return await this.prisma.configuracionAseo.create({
          data: {
            hora_limite_aseo: '17:00',
            frecuencia_rotacion_colchones: 180,
            dias_aviso_rotacion_colchones: 5,
            habilitar_notificaciones: false,
            elementos_aseo_default: [],
            elementos_proteccion_default: [],
            productos_quimicos_default: [],
            areas_intervenir_habitacion_default: [],
            areas_intervenir_banio_default: [],
            ...updateConfiguracionAseoDto,
          },
        });
      }
    } catch (error) {
      throw new BadRequestException(
        'Error al actualizar configuración de aseo',
      );
    }
  }
}
