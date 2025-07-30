import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateConfiguracionAseoDto } from './dto/update-configuracion-aseo.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfiguracionAseo } from '@prisma/client';

/**
 * Service para manejar la configuración del módulo de aseo
 */
@Injectable()
export class ConfiguracionAseoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
            hora_proceso_nocturno_utc: '05:00',
            frecuencia_rotacion_colchones: 180,
            dias_aviso_rotacion_colchones: 5,
            habilitar_notificaciones: false,
            elementos_aseo_default: [],
            elementos_proteccion_default: [],
            productos_quimicos_default: [],
            areas_intervenir_habitacion_default: [],
            areas_intervenir_banio_default: [],
            procedimiento_aseo_habitacion_default: '',
            procedimiento_desinfeccion_habitacion_default: '',
            procedimiento_limieza_zona_comun_default: '',
            procedimiento_desinfeccion_zona_comun_default: '',
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
          orderBy: { createdAt: 'desc' },
        });

      if (configuracionExistente) {
        // Actualizar la configuración existente
        const configuracionActualizada =
          await this.prisma.configuracionAseo.update({
            where: { id: configuracionExistente.id },
            data: updateConfiguracionAseoDto,
          });

        // Emitir evento de actualización de configuración
        this.emitirEventosSiHayCambiosRelevantes(
          configuracionExistente,
          configuracionActualizada,
        );

        return configuracionActualizada;
      } else {
        // Crear nueva configuración con valores por defecto y los datos proporcionados
        return await this.prisma.configuracionAseo.create({
          data: {
            hora_limite_aseo: '17:00',
            hora_proceso_nocturno_utc: '05:00',
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

  private emitirEventosSiHayCambiosRelevantes(
    anterior: ConfiguracionAseo,
    nueva: ConfiguracionAseo,
  ) {
    // Cambió la hora del cron
    if (
      anterior.hora_proceso_nocturno_utc !== nueva.hora_proceso_nocturno_utc
    ) {
      this.eventEmitter.emit('configuracion-aseo.hora-proceso-cambiada', {
        horaAnterior: anterior.hora_proceso_nocturno_utc,
        horaNueva: nueva.hora_proceso_nocturno_utc,
      });
    }

    // Cambió configuración de notificaciones
    if (anterior.habilitar_notificaciones !== nueva.habilitar_notificaciones) {
      this.eventEmitter.emit('configuracion-aseo.notificaciones-cambiadas', {
        anterior: anterior.habilitar_notificaciones,
        nueva: nueva.habilitar_notificaciones,
      });
    }

    // Otros cambios relevantes...
  }
}
