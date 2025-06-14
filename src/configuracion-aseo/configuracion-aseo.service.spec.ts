import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionAseoService } from './configuracion-aseo.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { UpdateConfiguracionAseoDto } from './dto/update-configuracion-aseo.dto';

describe('ConfiguracionAseoService', () => {
  let service: ConfiguracionAseoService;

  // Mock de PrismaService
  const mockPrismaService = {
    configuracionAseo: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfiguracionAseoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConfiguracionAseoService>(ConfiguracionAseoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });
  });

  describe('obtenerConfiguracion', () => {
    const configuracionMock = {
      id: 1,
      hora_limite_aseo: '17:00',
      frecuencia_rotacion_colchones: 180,
      dias_aviso_rotacion_colchones: 5,
      habilitar_notificaciones: false,
      email_notificaciones: null,
      elementos_aseo_default: ['Escoba', 'Trapeador', 'Detergente'],
      elementos_proteccion_default: ['Guantes', 'Mascarilla'],
      productos_quimicos_default: ['Desinfectante', 'Limpiador multiusos'],
      areas_intervenir_habitacion_default: ['Cama', 'Baño', 'Piso'],
      areas_intervenir_banio_default: ['Inodoro', 'Lavamanos', 'Ducha'],
      procedimiento_aseo_habitacion_default:
        'Limpiar superficies, aspirar, etc.',
      procedimiento_desinfeccion_habitacion_default:
        'Aplicar desinfectante en todas las superficies',
      procedimiento_rotacion_colchones_default: 'Rotar colchón 180 grados',
      procedimiento_limieza_zona_comun_default:
        'Limpiar áreas comunes diariamente',
      procedimiento_desinfeccion_zona_comun_default: 'Desinfectar mensualmente',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería obtener la configuración existente correctamente', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(
        configuracionMock,
      );

      // Act
      const resultado = await service.obtenerConfiguracion();

      // Assert
      expect(
        mockPrismaService.configuracionAseo.findFirst,
      ).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(resultado).toEqual(configuracionMock);
    });

    it('debería crear configuración por defecto si no existe ninguna', async () => {
      // Arrange
      const configuracionDefecto = {
        ...configuracionMock,
        id: 1,
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(null);
      mockPrismaService.configuracionAseo.create.mockResolvedValue(
        configuracionDefecto,
      );

      // Act
      const resultado = await service.obtenerConfiguracion();

      // Assert
      expect(
        mockPrismaService.configuracionAseo.findFirst,
      ).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.configuracionAseo.create).toHaveBeenCalledWith({
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
        },
      });
      expect(resultado).toEqual(configuracionDefecto);
    });

    it('debería lanzar BadRequestException cuando ocurre un error al obtener configuración', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.obtenerConfiguracion()).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.obtenerConfiguracion()).rejects.toThrow(
        'Error al obtener configuración de aseo',
      );
    });

    it('debería lanzar BadRequestException cuando ocurre un error al crear configuración por defecto', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(null);
      mockPrismaService.configuracionAseo.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.obtenerConfiguracion()).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.obtenerConfiguracion()).rejects.toThrow(
        'Error al obtener configuración de aseo',
      );
    });
  });

  describe('actualizarConfiguracion', () => {
    const updateDto: UpdateConfiguracionAseoDto = {
      hora_limite_aseo: '18:00',
      frecuencia_rotacion_colchones: 90,
      dias_aviso_rotacion_colchones: 3,
      habilitar_notificaciones: true,
      email_notificaciones: 'admin@hotel.com',
      elementos_aseo_default: ['Escoba nueva', 'Trapeador nuevo'],
      elementos_proteccion_default: ['Guantes nuevos'],
      productos_quimicos_default: ['Desinfectante premium'],
      areas_intervenir_habitacion_default: ['Todas las áreas'],
      areas_intervenir_banio_default: ['Baño completo'],
      procedimiento_aseo_habitacion_default: 'Procedimiento actualizado',
      procedimiento_desinfeccion_habitacion_default: 'Desinfección mejorada',
      procedimiento_rotacion_colchones_default: 'Rotación mejorada',
      procedimiento_limieza_zona_comun_default: 'Limpieza mejorada',
      procedimiento_desinfeccion_zona_comun_default: 'Desinfección mejorada',
    };

    const configuracionActualizada = {
      id: 1,
      ...updateDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('debería actualizar la configuración correctamente cuando existe', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockResolvedValue(
        configuracionActualizada,
      );

      // Act
      const resultado = await service.actualizarConfiguracion(updateDto);

      // Assert
      expect(
        mockPrismaService.configuracionAseo.findFirst,
      ).toHaveBeenCalledWith({
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.configuracionAseo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
      expect(resultado).toEqual(configuracionActualizada);
    });

    it('debería crear nueva configuración si no existe ninguna', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(null);
      mockPrismaService.configuracionAseo.create.mockResolvedValue(
        configuracionActualizada,
      );

      // Act
      const resultado = await service.actualizarConfiguracion(updateDto);

      // Assert
      expect(
        mockPrismaService.configuracionAseo.findFirst,
      ).toHaveBeenCalledWith({
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.configuracionAseo.create).toHaveBeenCalledWith({
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
          ...updateDto,
        },
      });
      expect(resultado).toEqual(configuracionActualizada);
    });

    it('debería lanzar BadRequestException cuando ocurre un error en la actualización', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.actualizarConfiguracion(updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.actualizarConfiguracion(updateDto)).rejects.toThrow(
        'Error al actualizar configuración de aseo',
      );
    });

    it('debería lanzar BadRequestException cuando ocurre un error al crear nueva configuración', async () => {
      // Arrange
      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(null);
      mockPrismaService.configuracionAseo.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.actualizarConfiguracion(updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.actualizarConfiguracion(updateDto)).rejects.toThrow(
        'Error al actualizar configuración de aseo',
      );
    });

    it('debería manejar datos parciales en el DTO de actualización', async () => {
      // Arrange
      const updateDtoParcial: UpdateConfiguracionAseoDto = {
        hora_limite_aseo: '16:00',
        habilitar_notificaciones: true,
      };

      const configuracionParcialActualizada = {
        id: 1,
        ...updateDtoParcial,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockResolvedValue(
        configuracionParcialActualizada,
      );

      // Act
      const resultado = await service.actualizarConfiguracion(updateDtoParcial);

      // Assert
      expect(mockPrismaService.configuracionAseo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDtoParcial,
      });
      expect(resultado).toEqual(configuracionParcialActualizada);
    });
  });

  describe('Validaciones de campos específicos', () => {
    it('debería validar formato de hora_limite_aseo', async () => {
      // Arrange
      const updateDtoInvalidoHora: UpdateConfiguracionAseoDto = {
        hora_limite_aseo: '25:00', // Hora inválida
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockRejectedValue(
        new Error('Invalid time format'),
      );

      // Act & Assert
      await expect(
        service.actualizarConfiguracion(updateDtoInvalidoHora),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería validar email_notificaciones cuando se habilitan notificaciones', async () => {
      // Arrange
      const updateDtoEmailInvalido: UpdateConfiguracionAseoDto = {
        habilitar_notificaciones: true,
        email_notificaciones: 'email-invalido',
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockRejectedValue(
        new Error('Invalid email format'),
      );

      // Act & Assert
      await expect(
        service.actualizarConfiguracion(updateDtoEmailInvalido),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería validar que frecuencia_rotacion_colchones sea positiva', async () => {
      // Arrange
      const updateDtoFrecuenciaInvalida: UpdateConfiguracionAseoDto = {
        frecuencia_rotacion_colchones: -1,
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockRejectedValue(
        new Error('Invalid frequency value'),
      );

      // Act & Assert
      await expect(
        service.actualizarConfiguracion(updateDtoFrecuenciaInvalida),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería validar que dias_aviso_rotacion_colchones sea positivo', async () => {
      // Arrange
      const updateDtoDiasInvalidos: UpdateConfiguracionAseoDto = {
        dias_aviso_rotacion_colchones: -5,
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockRejectedValue(
        new Error('Invalid days value'),
      );

      // Act & Assert
      await expect(
        service.actualizarConfiguracion(updateDtoDiasInvalidos),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar arrays vacíos correctamente', async () => {
      // Arrange
      const updateDtoArraysVacios: UpdateConfiguracionAseoDto = {
        elementos_aseo_default: [],
        elementos_proteccion_default: [],
        productos_quimicos_default: [],
        areas_intervenir_habitacion_default: [],
        areas_intervenir_banio_default: [],
      };

      const configuracionConArraysVacios = {
        id: 1,
        ...updateDtoArraysVacios,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockResolvedValue(
        configuracionConArraysVacios,
      );

      // Act
      const resultado = await service.actualizarConfiguracion(
        updateDtoArraysVacios,
      );

      // Assert
      expect(resultado.elementos_aseo_default).toEqual([]);
      expect(resultado.elementos_proteccion_default).toEqual([]);
      expect(resultado.productos_quimicos_default).toEqual([]);
      expect(resultado.areas_intervenir_habitacion_default).toEqual([]);
      expect(resultado.areas_intervenir_banio_default).toEqual([]);
    });

    it('debería manejar múltiples actualizaciones concurrentes', async () => {
      // Arrange
      const updateDto1: UpdateConfiguracionAseoDto = {
        hora_limite_aseo: '16:00',
      };
      const updateDto2: UpdateConfiguracionAseoDto = {
        hora_limite_aseo: '18:00',
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update
        .mockResolvedValueOnce({
          id: 1,
          ...updateDto1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 1,
          ...updateDto2,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // Act
      const [resultado1, resultado2] = await Promise.all([
        service.actualizarConfiguracion(updateDto1),
        service.actualizarConfiguracion(updateDto2),
      ]);

      // Assert
      expect(mockPrismaService.configuracionAseo.update).toHaveBeenCalledTimes(
        2,
      );
      expect(resultado1.hora_limite_aseo).toBe('16:00');
      expect(resultado2.hora_limite_aseo).toBe('18:00');
    });
  });

  describe('Integración con documentación API', () => {
    it('debería cumplir con el contrato de obtener configuración', async () => {
      // Arrange
      const configuracionCompleta = {
        id: 1,
        hora_limite_aseo: '17:00',
        frecuencia_rotacion_colchones: 180,
        dias_aviso_rotacion_colchones: 5,
        habilitar_notificaciones: false,
        email_notificaciones: null,
        elementos_aseo_default: ['Escoba', 'Trapeador'],
        elementos_proteccion_default: ['Guantes'],
        productos_quimicos_default: ['Desinfectante'],
        areas_intervenir_habitacion_default: ['Cama', 'Baño'],
        areas_intervenir_banio_default: ['Inodoro', 'Ducha'],
        procedimiento_aseo_habitacion_default: 'Procedimiento estándar',
        procedimiento_desinfeccion_habitacion_default: 'Desinfección estándar',
        procedimiento_rotacion_colchones_default: 'Rotación estándar',
        procedimiento_limieza_zona_comun_default: 'Limpieza estándar',
        procedimiento_desinfeccion_zona_comun_default: 'Desinfección estándar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue(
        configuracionCompleta,
      );

      // Act
      const resultado = await service.obtenerConfiguracion();

      // Assert
      expect(resultado).toMatchObject({
        id: expect.any(Number),
        hora_limite_aseo: expect.any(String),
        frecuencia_rotacion_colchones: expect.any(Number),
        dias_aviso_rotacion_colchones: expect.any(Number),
        habilitar_notificaciones: expect.any(Boolean),
        elementos_aseo_default: expect.any(Array),
        elementos_proteccion_default: expect.any(Array),
        productos_quimicos_default: expect.any(Array),
        areas_intervenir_habitacion_default: expect.any(Array),
        areas_intervenir_banio_default: expect.any(Array),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('debería cumplir con el contrato de actualizar configuración', async () => {
      // Arrange
      const updateDto: UpdateConfiguracionAseoDto = {
        hora_limite_aseo: '16:00',
        habilitar_notificaciones: true,
        email_notificaciones: 'test@hotel.com',
      };

      const configuracionActualizada = {
        id: 1,
        ...updateDto,
        frecuencia_rotacion_colchones: 180,
        dias_aviso_rotacion_colchones: 5,
        elementos_aseo_default: [],
        elementos_proteccion_default: [],
        productos_quimicos_default: [],
        areas_intervenir_habitacion_default: [],
        areas_intervenir_banio_default: [],
        procedimiento_aseo_habitacion_default: null,
        procedimiento_desinfeccion_habitacion_default: null,
        procedimiento_rotacion_colchones_default: null,
        procedimiento_limieza_zona_comun_default: null,
        procedimiento_desinfeccion_zona_comun_default: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.configuracionAseo.findFirst.mockResolvedValue({
        id: 1,
      });
      mockPrismaService.configuracionAseo.update.mockResolvedValue(
        configuracionActualizada,
      );

      // Act
      const resultado = await service.actualizarConfiguracion(updateDto);

      // Assert
      expect(resultado).toMatchObject({
        id: expect.any(Number),
        hora_limite_aseo: expect.any(String),
        frecuencia_rotacion_colchones: expect.any(Number),
        dias_aviso_rotacion_colchones: expect.any(Number),
        habilitar_notificaciones: expect.any(Boolean),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(resultado.hora_limite_aseo).toBe('16:00');
      expect(resultado.habilitar_notificaciones).toBe(true);
      expect(resultado.email_notificaciones).toBe('test@hotel.com');
    });
  });
});
