import { Test, TestingModule } from '@nestjs/testing';
import { RegistroFormularioService } from './registro-formulario.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { TraService } from 'src/TRA/tra.service';
import { HuespedesService } from 'src/huespedes/huespedes.service';
import { DtoFactoryService } from 'src/common/factories/dto_Factory/dtoFactoryService.service';
import { ReservasService } from 'src/reservas/reservas.service';
import { FacturasService } from 'src/facturas/facturas.service';
import { HabitacionesService } from 'src/habitaciones/habitaciones.service';
import { FormularioService } from './formulario/formulario.service';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';
import { HuespedesSecundariosService } from 'src/huespedes-secundarios/huespedes-secundarios.service';
import { SireService } from 'src/sire/sire.service';
import { FormulariosService } from 'src/formularios/formularios.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('RegistroFormularioService', () => {
  let service: RegistroFormularioService;
  let prismaService: PrismaService;
  let traService: TraService;
  let huespedService: HuespedesService;
  let habitacionesService: HabitacionesService;

  // Mock del PrismaService
  const mockPrismaService = {
    $transaction: jest.fn(),
    formulario: {
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock del TraService
  const mockTraService = {
    postTra: jest.fn(),
  };

  // Mock del HuespedesService
  const mockHuespedService = {
    findOrCreateHuesped: jest.fn(),
  };

  // Mock del DtoFactoryService
  const mockDtoFactoryService = {
    getFactory: jest.fn(),
  };

  // Mock del ReservasService
  const mockReservasService = {
    createTransaction: jest.fn(),
    UpdateTransaction: jest.fn(),
  };

  // Mock del FacturasService
  const mockFacturasService = {
    createTransaction: jest.fn(),
  };

  // Mock del HabitacionesService
  const mockHabitacionesService = {
    findByNumeroHabitacion: jest.fn(),
  };

  // Mock del FormularioService
  const mockFormularioService = {
    createTransaction: jest.fn(),
  };

  // Mock del LinkFormularioService
  const mockLinkFormularioService = {
    UpdateTransaction: jest.fn(),
  };

  // Mock del HuespedesSecundariosService
  const mockHuespedesSecundariosService = {
    createManyTransaction: jest.fn(),
  };

  // Mock del SireService
  const mockSireService = {};

  // Mock del FormulariosService
  const mockFormulariosService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistroFormularioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TraService,
          useValue: mockTraService,
        },
        {
          provide: HuespedesService,
          useValue: mockHuespedService,
        },
        {
          provide: DtoFactoryService,
          useValue: mockDtoFactoryService,
        },
        {
          provide: ReservasService,
          useValue: mockReservasService,
        },
        {
          provide: FacturasService,
          useValue: mockFacturasService,
        },
        {
          provide: HabitacionesService,
          useValue: mockHabitacionesService,
        },
        {
          provide: FormularioService,
          useValue: mockFormularioService,
        },
        {
          provide: LinkFormularioService,
          useValue: mockLinkFormularioService,
        },
        {
          provide: HuespedesSecundariosService,
          useValue: mockHuespedesSecundariosService,
        },
        {
          provide: SireService,
          useValue: mockSireService,
        },
        {
          provide: FormulariosService,
          useValue: mockFormulariosService,
        },
      ],
    }).compile();

    service = module.get<RegistroFormularioService>(RegistroFormularioService);
    prismaService = module.get<PrismaService>(PrismaService);
    traService = module.get<TraService>(TraService);
    huespedService = module.get<HuespedesService>(HuespedesService);
    habitacionesService = module.get<HabitacionesService>(HabitacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('debería estar definido', () => {
      expect(service).toBeDefined();
    });

    it('debería tener todas las dependencias inyectadas', () => {
      expect(prismaService).toBeDefined();
      expect(traService).toBeDefined();
      expect(huespedService).toBeDefined();
      expect(habitacionesService).toBeDefined();
    });
  });

  describe('create', () => {
    it('debería crear un formulario sin TRA exitosamente', async () => {
      // Arrange
      const createDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        numero_habitacion: 101,
        fecha_inicio: new Date('2024-01-15'),
        fecha_fin: new Date('2024-01-20'),
        costo: 500,
      } as any;
      const tokenId = 1;

      const huesped = { id: 1, nombre: 'Juan', apellido: 'Pérez' };
      const habitacion = { id: 1, numero_habitacion: 101 };
      const reservaDto = { huespedId: 1, habitacionId: 1 };
      const facturaDto = { huespedId: 1, costo: 500 };

      const transactionResult = {
        success: true,
        huesped,
        facturaCreated: { id: 1, costo: 500 },
        reservaCreated: { id: 1, numero_habitacion: 101 },
        formulario: { id: 1, completado: true },
        linkFormulario: { id: 1, completado: true, formularioId: 1 },
        huespedesSecundariosCreated: [],
        timestamp: new Date(),
      };

      // Configurar mocks
      const mockHuespedFactory = {
        create: jest.fn().mockReturnValue(reservaDto),
      };
      const mockReservaFactory = {
        create: jest.fn().mockReturnValue(reservaDto),
      };
      const mockFacturaFactory = {
        create: jest.fn().mockReturnValue(facturaDto),
      };

      mockDtoFactoryService.getFactory
        .mockReturnValueOnce(mockHuespedFactory)
        .mockReturnValueOnce(mockReservaFactory)
        .mockReturnValueOnce(mockFacturaFactory);

      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );
      mockPrismaService.$transaction.mockResolvedValue(transactionResult);

      // Act
      const resultado = await service.create(createDto, tokenId);

      // Assert
      expect(resultado).toEqual({
        success: true,
        result: transactionResult,
        message: 'Formulario registrado exitosamente sin integración con TRA',
      });

      expect(huespedService.findOrCreateHuesped).toHaveBeenCalledTimes(1);
      expect(habitacionesService.findByNumeroHabitacion).toHaveBeenCalledWith(
        101,
      );
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar error cuando la habitación no existe', async () => {
      // Arrange
      const createDto = { numero_habitacion: 999 } as any;
      const tokenId = 1;
      const huesped = { id: 1 };

      const mockHuespedFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockHuespedFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, tokenId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto, tokenId)).rejects.toThrow(
        'La habitación con número 999 no existe',
      );
    });

    it('debería manejar errores al obtener huésped', async () => {
      // Arrange
      const createDto = { nombre: 'Test' } as any;
      const tokenId = 1;

      const mockHuespedFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockHuespedFactory);
      mockHuespedService.findOrCreateHuesped.mockRejectedValue(
        new Error('Error BD huésped'),
      );

      // Act & Assert
      await expect(service.create(createDto, tokenId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, tokenId)).rejects.toThrow(
        'Error al procesar datos del huésped',
      );
    });
  });

  describe('createWithTra', () => {
    it('debería crear un formulario con TRA exitosamente', async () => {
      // Arrange
      const createDto = { numero_habitacion: 101 } as any;
      const tokenId = 1;

      const huesped = { id: 1 };
      const habitacion = { id: 1, numero_habitacion: 101 };
      const transactionResult = {
        success: true,
        formulario: { id: 1 },
        reservaCreated: { id: 1 },
        huesped,
      };
      const traResult = { id: 1, SubidoATra: true, traId: 'TRA123' };

      // Configurar mocks
      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );
      mockPrismaService.$transaction.mockResolvedValue(transactionResult);

      // Mock para registerTraSeparate
      const mockTraData = { huespedPrincipal: { code: 'TRA123' } };
      mockTraService.postTra.mockResolvedValue(mockTraData);
      mockPrismaService.formulario.findFirstOrThrow.mockResolvedValue({
        id: 1,
        SubidoATra: false,
      });
      mockPrismaService.formulario.update.mockResolvedValue(traResult);

      // Mock la transacción de TRA
      mockPrismaService.$transaction
        .mockResolvedValueOnce(transactionResult) // Primera llamada para executeTransaction
        .mockImplementationOnce(async (callback) => {
          // Segunda llamada para registerTraSeparate
          const mockTx = {
            formulario: {
              findFirstOrThrow: jest
                .fn()
                .mockResolvedValue({ id: 1, SubidoATra: false }),
              update: jest.fn().mockResolvedValue(traResult),
            },
          };
          return await callback(mockTx);
        });

      // Act
      const resultado = await service.createWithTra(createDto, tokenId);

      // Assert
      expect(resultado).toEqual({
        success: true,
        result: transactionResult,
        traFormulario: traResult,
        message: 'Formulario registrado exitosamente',
      });

      expect(traService.postTra).toHaveBeenCalledWith(1);
    });

    it('debería manejar éxito parcial cuando TRA falla', async () => {
      // Arrange
      const createDto = { numero_habitacion: 101 } as any;
      const tokenId = 1;

      const huesped = { id: 1 };
      const habitacion = { id: 1 };
      const transactionResult = {
        success: true,
        formulario: { id: 1 },
        reservaCreated: { id: 1 },
        huesped,
      };

      // Configurar mocks para éxito del formulario
      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );
      mockPrismaService.$transaction
        .mockResolvedValueOnce(transactionResult) // Éxito en executeTransaction
        .mockRejectedValueOnce(new Error('Error TRA')); // Fallo en registerTraSeparate

      // Act
      const resultado = await service.createWithTra(createDto, tokenId);

      // Assert
      expect(resultado).toEqual({
        success: true,
        result: transactionResult,
        traRegistration: {
          success: false,
          error: 'Error TRA',
        },
        message:
          'Formulario registrado exitosamente pero falló el registro en TRA',
      });
    });

    it('debería propagar errores de la transacción principal', async () => {
      // Arrange
      const createDto = { numero_habitacion: 101 } as any;
      const tokenId = 1;

      const huesped = { id: 1 };
      const habitacion = { id: 1 };

      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Error transacción'),
      );

      // Act & Assert
      await expect(service.createWithTra(createDto, tokenId)).rejects.toThrow(
        'Error transacción',
      );
    });
  });

  describe('registerFormularioInTra', () => {
    it('debería registrar un formulario en TRA exitosamente', async () => {
      // Arrange
      const formularioId = 1;
      const formulario = { id: 1, SubidoATra: false };
      const traData = { huespedPrincipal: { code: 'TRA456' } };
      const updatedFormulario = { id: 1, SubidoATra: true, traId: 'TRA456' };

      // Mock de la transacción
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          formulario: {
            findFirstOrThrow: jest.fn().mockResolvedValue(formulario),
            update: jest.fn().mockResolvedValue(updatedFormulario),
          },
        };
        return await callback(mockTx);
      });

      mockTraService.postTra.mockResolvedValue(traData);

      // Act
      const resultado = await service.registerFormularioInTra(formularioId);

      // Assert
      expect(resultado).toEqual({
        success: true,
        message: 'Formulario registrado exitosamente en TRA',
        formulario: updatedFormulario,
        traData,
      });

      expect(traService.postTra).toHaveBeenCalledWith(1);
    });

    it('debería retornar mensaje cuando formulario ya está registrado', async () => {
      // Arrange
      const formularioId = 1;
      const formularioYaRegistrado = {
        id: 1,
        SubidoATra: true,
        traId: 'TRA123',
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          formulario: {
            findFirstOrThrow: jest
              .fn()
              .mockResolvedValue(formularioYaRegistrado),
          },
        };
        return await callback(mockTx);
      });

      // Act
      const resultado = await service.registerFormularioInTra(formularioId);

      // Assert
      expect(resultado).toEqual({
        success: true,
        message: 'El formulario ya estaba registrado en TRA con ID TRA123',
        formulario: formularioYaRegistrado,
      });

      expect(traService.postTra).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando formulario no existe', async () => {
      // Arrange
      const formularioId = 999;
      const errorP2025 = { code: 'P2025' };

      mockPrismaService.$transaction.mockRejectedValue(errorP2025);

      // Act & Assert
      await expect(
        service.registerFormularioInTra(formularioId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.registerFormularioInTra(formularioId),
      ).rejects.toThrow('Formulario con ID 999 no encontrado');
    });

    it('debería manejar errores de TRA en transacción', async () => {
      // Arrange
      const formularioId = 1;
      const formulario = { id: 1, SubidoATra: false };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          formulario: {
            findFirstOrThrow: jest.fn().mockResolvedValue(formulario),
            update: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      mockTraService.postTra.mockRejectedValue(new Error('Error TRA service'));

      // Act & Assert
      await expect(
        service.registerFormularioInTra(formularioId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registerFormularioInTra(formularioId),
      ).rejects.toThrow('Error al registrar formulario en TRA');
    });

    it('debería manejar respuesta inválida de TRA', async () => {
      // Arrange
      const formularioId = 1;
      const formulario = { id: 1, SubidoATra: false };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          formulario: {
            findFirstOrThrow: jest.fn().mockResolvedValue(formulario),
          },
        };
        return await callback(mockTx);
      });

      mockTraService.postTra.mockResolvedValue(null); // Respuesta inválida

      // Act & Assert
      await expect(
        service.registerFormularioInTra(formularioId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registerFormularioInTra(formularioId),
      ).rejects.toThrow('Respuesta inválida del servicio TRA');
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar transacción compleja con huéspedes secundarios', async () => {
      // Arrange
      const createDto = {
        numero_habitacion: 101,
        huespedes_secundarios: [
          { nombre: 'Acompañante 1' },
          { nombre: 'Acompañante 2' },
        ],
      } as any;
      const tokenId = 1;

      const huesped = { id: 1 };
      const habitacion = { id: 1 };
      const huespedesSecundarios = [
        { id: 1, nombre: 'Acompañante 1' },
        { id: 2, nombre: 'Acompañante 2' },
      ];

      // Configurar mocks
      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );

      // Mock de transacción compleja
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          linkFormulario: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: 1, completado: false }),
          },
        };

        // Configurar mocks para los servicios transaccionales
        mockFacturasService.createTransaction.mockResolvedValue({ id: 1 });
        mockReservasService.createTransaction.mockResolvedValue({ id: 1 });
        mockFormularioService.createTransaction.mockResolvedValue({ id: 1 });
        mockHuespedesSecundariosService.createManyTransaction.mockResolvedValue(
          huespedesSecundarios,
        );
        mockReservasService.UpdateTransaction.mockResolvedValue({
          id: 1,
          huespedes_secundarios: huespedesSecundarios,
        });
        mockLinkFormularioService.UpdateTransaction.mockResolvedValue({
          id: 1,
          completado: true,
        });

        return await callback(mockTx);
      });

      // Act
      const resultado = await service.create(createDto, tokenId);

      // Assert
      expect(resultado.success).toBe(true);
      expect(
        mockHuespedesSecundariosService.createManyTransaction,
      ).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ huespedId: 1 })]),
        expect.any(Object),
      );
    });

    it('debería manejar conflicto cuando ya existe formulario completado', async () => {
      // Arrange
      const createDto = { numero_habitacion: 101 } as any;
      const tokenId = 1;

      const huesped = { id: 1 };
      const habitacion = { id: 1 };

      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );

      // Mock transacción que detecta conflicto
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          linkFormulario: {
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              completado: true,
              formularioId: 5,
            }),
          },
        };
        return await callback(mockTx);
      });

      // Act & Assert
      await expect(service.create(createDto, tokenId)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto, tokenId)).rejects.toThrow(
        'Ya existe un formulario completado para este token',
      );
    });

    it('debería manejar diferentes tipos de errores Prisma correctamente', async () => {
      // Arrange
      const createDto = { numero_habitacion: 101 } as any;
      const tokenId = 1;

      const erroresPrisma = [
        { code: 'P2002', meta: { target: ['email'] } },
        { code: 'P2003', meta: { field_name: 'usuario_id' } },
        { code: 'P2025', meta: { cause: 'Record not found' } },
      ];

      const huesped = { id: 1 };
      const habitacion = { id: 1 };

      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );

      // Act & Assert
      for (const error of erroresPrisma) {
        mockPrismaService.$transaction.mockRejectedValue(error);

        if (error.code === 'P2002') {
          await expect(service.create(createDto, tokenId)).rejects.toThrow(
            ConflictException,
          );
        } else if (error.code === 'P2003') {
          await expect(service.create(createDto, tokenId)).rejects.toThrow(
            BadRequestException,
          );
        } else if (error.code === 'P2025') {
          await expect(service.create(createDto, tokenId)).rejects.toThrow(
            NotFoundException,
          );
        }
      }
    });

    it('debería manejar caso donde no hay huéspedes secundarios', async () => {
      // Arrange
      const createDto = {
        numero_habitacion: 101,
        huespedes_secundarios: undefined,
      } as any;
      const tokenId = 1;

      const huesped = { id: 1 };
      const habitacion = { id: 1 };

      const mockFactory = { create: jest.fn().mockReturnValue({}) };
      mockDtoFactoryService.getFactory.mockReturnValue(mockFactory);
      mockHuespedService.findOrCreateHuesped.mockResolvedValue(huesped);
      mockHabitacionesService.findByNumeroHabitacion.mockResolvedValue(
        habitacion,
      );

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          linkFormulario: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: 1, completado: false }),
          },
        };

        mockFacturasService.createTransaction.mockResolvedValue({ id: 1 });
        mockReservasService.createTransaction.mockResolvedValue({ id: 1 });
        mockFormularioService.createTransaction.mockResolvedValue({ id: 1 });
        mockLinkFormularioService.UpdateTransaction.mockResolvedValue({
          id: 1,
          completado: true,
        });

        return await callback(mockTx);
      });

      // Act
      const resultado = await service.create(createDto, tokenId);

      // Assert
      expect(resultado.success).toBe(true);
      expect(
        mockHuespedesSecundariosService.createManyTransaction,
      ).not.toHaveBeenCalled();
    });
  });
});
