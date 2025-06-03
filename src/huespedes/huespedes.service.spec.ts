import { Test, TestingModule } from '@nestjs/testing';
import { HuespedesService } from './huespedes.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { DocumentosService } from 'src/documentos/documentos.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedDto } from './dto/update-huesped.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { Prisma } from '@prisma/client';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';
import { Genero } from 'src/common/enums/generos.enum';

describe('HuespedesService', () => {
  let service: HuespedesService;
  let prismaService: PrismaService;
  let documentosService: DocumentosService;

  // Mock del PrismaService
  const mockPrismaService = {
    huesped: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock del DocumentosService
  const mockDocumentosService = {
    removeAllByHuespedId: jest.fn(),
  };

  // Datos mock para las pruebas
  const mockCreateHuespedDto: CreateHuespedDto = {
    nombres: 'Juan Carlos',
    primer_apellido: 'Pérez',
    segundo_apellido: 'López',
    tipo_documento: TipoDoc.CC,
    numero_documento: '12345678',
    telefono: '3001234567',
    correo: 'juan.perez@email.com',
    fecha_nacimiento: new Date('1990-05-15'),
    genero: Genero.MASCULINO,
    nacionalidad: 'COLOMBIANA',
    ocupacion: 'Ingeniero',
    pais_residencia: 'Colombia',
    ciudad_residencia: 'Medellín',
    pais_procedencia: 'Colombia',
    ciudad_procedencia: 'Medellín',
    lugar_nacimiento: 'Bogotá',
  };

  const mockHuesped = {
    id: 1,
    ...mockCreateHuespedDto,
    deleted: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  const mockUpdateHuespedDto: UpdateHuespedDto = {
    telefono: '3009876543',
    ocupacion: 'Arquitecto',
  };

  beforeEach(async () => {
    // Resetear completamente todos los mocks antes de cada test
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HuespedesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DocumentosService,
          useValue: mockDocumentosService,
        },
      ],
    }).compile();

    service = module.get<HuespedesService>(HuespedesService);
    prismaService = module.get<PrismaService>(PrismaService);
    documentosService = module.get<DocumentosService>(DocumentosService);
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
      expect(documentosService).toBeDefined();
    });
  });

  // ================================================================
  // CREATE - Crear huésped
  // ================================================================
  describe('create', () => {
    it('debería crear un huésped exitosamente', async () => {
      // Arrange
      mockPrismaService.huesped.create.mockResolvedValue(mockHuesped);

      // Act
      const resultado = await service.create(mockCreateHuespedDto);

      // Assert
      expect(resultado).toEqual(mockHuesped);
      expect(prismaService.huesped.create).toHaveBeenCalledWith({
        data: mockCreateHuespedDto,
      });
      expect(prismaService.huesped.create).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar BadRequestException cuando el huésped ya existe', async () => {
      // Arrange
      const errorPrisma = { code: 'P2002' };
      mockPrismaService.huesped.create.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.create(mockCreateHuespedDto)).rejects.toThrow(
        new BadRequestException('El huésped ya existe'),
      );
      expect(prismaService.huesped.create).toHaveBeenCalledWith({
        data: mockCreateHuespedDto,
      });
    });

    it('debería propagar otros errores que no sean P2002', async () => {
      // Arrange
      const errorConexionBD = new Error('Error de conexión a la base de datos');
      mockPrismaService.huesped.create.mockRejectedValue(errorConexionBD);

      // Act & Assert
      await expect(service.create(mockCreateHuespedDto)).rejects.toThrow(
        'Error de conexión a la base de datos',
      );
    });
  });

  // ================================================================
  // FIND ALL - Listar huéspedes con paginación
  // ================================================================
  describe('findAll', () => {
    it('debería obtener huéspedes con paginación exitosamente', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const huespedesEncontrados = [
        { ...mockHuesped, id: 1 },
        { ...mockHuesped, id: 2, nombres: 'María' },
      ];

      mockPrismaService.huesped.count.mockResolvedValue(2);
      mockPrismaService.huesped.findMany.mockResolvedValue(
        huespedesEncontrados,
      );

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado).toEqual({
        data: huespedesEncontrados,
        meta: { page: 1, limit: 10, total: 2, lastPage: 1 },
      });

      expect(prismaService.huesped.count).toHaveBeenCalledWith({
        where: { deleted: false },
      });

      expect(prismaService.huesped.findMany).toHaveBeenCalledWith({
        skip: 0, // (page - 1) * limit
        take: 10,
        where: { deleted: false },
        include: {
          reservas: {
            where: {
              deleted: false,
            },
          },
        },
      });
    });

    it('debería calcular paginación correctamente', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 3, limit: 5 };

      mockPrismaService.huesped.count.mockResolvedValue(15);
      mockPrismaService.huesped.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado.meta).toEqual({
        page: 3,
        limit: 5,
        total: 15,
        lastPage: 3, // Math.ceil(15 / 5)
      });

      expect(prismaService.huesped.findMany).toHaveBeenCalledWith({
        skip: 10, // (3 - 1) * 5
        take: 5,
        where: { deleted: false },
        include: {
          reservas: {
            where: {
              deleted: false,
            },
          },
        },
      });
    });

    it('debería retornar respuesta vacía cuando no hay datos', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };

      mockPrismaService.huesped.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.lastPage).toBe(0);

      // Verificar que NO se ejecutó findMany cuando totalHuespedes es 0
      expect(prismaService.huesped.findMany).not.toHaveBeenCalled();
    });

    it('debería retornar respuesta vacía cuando page excede lastPage', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 5, limit: 10 };

      mockPrismaService.huesped.count.mockResolvedValue(20); // lastPage = 2

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.page).toBe(5);
      expect(resultado.meta.lastPage).toBe(2);

      // Verificar que NO se ejecutó findMany cuando page > lastPage
      expect(prismaService.huesped.findMany).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // FIND ONE - Buscar huésped por ID
  // ================================================================
  describe('findOne', () => {
    it('debería encontrar un huésped por ID exitosamente', async () => {
      // Arrange
      const huespedId = 1;
      mockPrismaService.huesped.findFirstOrThrow.mockResolvedValue(mockHuesped);

      // Act
      const resultado = await service.findOne(huespedId);

      // Assert
      expect(resultado).toEqual(mockHuesped);
      expect(prismaService.huesped.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        include: {
          reservas: {
            where: {
              deleted: false,
            },
          },
          huespedes_secundarios: {
            where: {
              deleted: false,
            },
          },
        },
      });
    });

    it('debería lanzar NotFoundException cuando el huésped no existe', async () => {
      // Arrange
      const huespedId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.huesped.findFirstOrThrow.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.findOne(huespedId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.huesped.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 999, deleted: false },
        include: {
          reservas: {
            where: {
              deleted: false,
            },
          },
          huespedes_secundarios: {
            where: {
              deleted: false,
            },
          },
        },
      });
    });

    it('debería propagar otros errores que no sean P2025', async () => {
      // Arrange
      const huespedId = 1;
      const errorConexionFindOne = new Error('Error de conexión');

      mockPrismaService.huesped.findFirstOrThrow.mockRejectedValue(
        errorConexionFindOne,
      );

      // Act & Assert
      await expect(service.findOne(huespedId)).rejects.toThrow(
        'Error de conexión',
      );
    });
  });

  // ================================================================
  // FIND BY DOCUMENTO ID - Buscar huésped por número de documento
  // ================================================================
  describe('findByDocumentoId', () => {
    it('debería encontrar un huésped por número de documento exitosamente', async () => {
      // Arrange
      const documentoId = '12345678';
      mockPrismaService.huesped.findFirstOrThrow.mockResolvedValue(mockHuesped);

      // Act
      const resultado = await service.findByDocumentoId(documentoId);

      // Assert
      expect(resultado).toEqual(mockHuesped);
      expect(prismaService.huesped.findFirstOrThrow).toHaveBeenCalledWith({
        where: { numero_documento: '12345678', deleted: false },
      });
    });

    it('debería lanzar NotFoundException cuando el huésped no existe', async () => {
      // Arrange
      const documentoId = '99999999';
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.huesped.findFirstOrThrow.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.findByDocumentoId(documentoId)).rejects.toThrow(
        new NotFoundException(
          `No se encontró el huésped con el numero de documento: ${documentoId}`,
        ),
      );
    });

    it('debería propagar otros errores que no sean P2025', async () => {
      // Arrange
      const documentoId = '12345678';
      const errorConexionDocumento = new Error('Error interno');

      mockPrismaService.huesped.findFirstOrThrow.mockRejectedValue(
        errorConexionDocumento,
      );

      // Act & Assert
      await expect(service.findByDocumentoId(documentoId)).rejects.toThrow(
        'Error interno',
      );
    });
  });

  // ================================================================
  // UPDATE - Actualizar huésped
  // ================================================================
  describe('update', () => {
    it('debería actualizar un huésped exitosamente', async () => {
      // Arrange
      const huespedId = 1;
      const huespedActualizado = { ...mockHuesped, ...mockUpdateHuespedDto };

      mockPrismaService.huesped.update.mockResolvedValue(huespedActualizado);

      // Act
      const resultado = await service.update(huespedId, mockUpdateHuespedDto);

      // Assert
      expect(resultado).toEqual(huespedActualizado);
      expect(prismaService.huesped.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: mockUpdateHuespedDto,
      });
    });

    it('debería lanzar BadRequestException cuando no se proporcionan datos', async () => {
      // Arrange
      const huespedId = 1;
      const updateDtoVacio = {};

      // Act & Assert
      await expect(service.update(huespedId, updateDtoVacio)).rejects.toThrow(
        new BadRequestException(
          'Debe enviar datos para actualizar el huésped.',
        ),
      );

      // Verificar que NO se ejecutó la actualización
      expect(prismaService.huesped.update).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando el huésped no existe', async () => {
      // Arrange
      const huespedId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.huesped.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(
        service.update(huespedId, mockUpdateHuespedDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería propagar otros errores que no sean P2025', async () => {
      // Arrange
      const huespedId = 1;
      const errorValidacionUpdate = new Error('Error de validación');

      mockPrismaService.huesped.update.mockRejectedValue(errorValidacionUpdate);

      // Act & Assert
      await expect(
        service.update(huespedId, mockUpdateHuespedDto),
      ).rejects.toThrow('Error de validación');
    });
  });

  // ================================================================
  // REMOVE - Eliminar huésped (soft delete)
  // ================================================================
  describe('remove', () => {
    it('debería eliminar un huésped y sus documentos exitosamente', async () => {
      // Arrange
      const huespedId = 1;
      const huespedEliminado = { ...mockHuesped, deleted: true };

      mockPrismaService.huesped.update.mockResolvedValue(huespedEliminado);
      mockDocumentosService.removeAllByHuespedId.mockResolvedValue(undefined);

      // Act
      const resultado = await service.remove(huespedId);

      // Assert
      expect(resultado).toEqual(huespedEliminado);

      expect(prismaService.huesped.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: { deleted: true },
      });

      expect(documentosService.removeAllByHuespedId).toHaveBeenCalledWith(1);
      expect(documentosService.removeAllByHuespedId).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar NotFoundException cuando el huésped no existe', async () => {
      // Arrange
      const huespedId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.huesped.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.remove(huespedId)).rejects.toThrow(
        NotFoundException,
      );

      // Verificar que NO se llamó removeAllByHuespedId
      expect(documentosService.removeAllByHuespedId).not.toHaveBeenCalled();
    });

    it('debería propagar errores que no sean P2025', async () => {
      // Arrange
      const huespedId = 1;
      const errorBDRemove = new Error('Error de BD');

      mockPrismaService.huesped.update.mockRejectedValue(errorBDRemove);

      // Act & Assert
      await expect(service.remove(huespedId)).rejects.toThrow('Error de BD');
      expect(documentosService.removeAllByHuespedId).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // FIND OR CREATE HUESPED - Buscar o crear huésped
  // ================================================================
  describe('findOrCreateHuesped', () => {
    it('debería devolver huésped existente si ya existe', async () => {
      // Arrange
      const huespedExistente = mockHuesped;

      mockPrismaService.huesped.findFirst
        .mockResolvedValueOnce(huespedExistente) // Primera búsqueda: huésped activo
        .mockResolvedValueOnce(null); // Segunda búsqueda no se ejecuta

      // Act
      const resultado = await service.findOrCreateHuesped(mockCreateHuespedDto);

      // Assert
      expect(resultado).toEqual(huespedExistente);
      expect(prismaService.huesped.findFirst).toHaveBeenCalledWith({
        where: { numero_documento: '12345678', deleted: false },
      });
      expect(prismaService.huesped.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaService.huesped.create).not.toHaveBeenCalled();
      expect(prismaService.huesped.update).not.toHaveBeenCalled();
    });

    it('debería reactivar huésped eliminado si existe uno', async () => {
      // Arrange
      const huespedEliminadoLocal = { ...mockHuesped, deleted: true };
      const huespedReactivadoLocal = {
        ...mockHuesped,
        deleted: false,
        updatedAt: new Date(),
      };

      // Configurar mocks específicos para este test
      mockPrismaService.huesped.findFirst = jest
        .fn()
        .mockResolvedValueOnce(null) // Primera búsqueda: no hay huésped activo
        .mockResolvedValueOnce(huespedEliminadoLocal); // Segunda búsqueda: huésped eliminado

      mockPrismaService.huesped.update = jest
        .fn()
        .mockResolvedValue(huespedReactivadoLocal);

      // Act
      const resultado = await service.findOrCreateHuesped(mockCreateHuespedDto);

      // Assert
      expect(resultado).toEqual(huespedReactivadoLocal);

      expect(mockPrismaService.huesped.findFirst).toHaveBeenNthCalledWith(1, {
        where: { numero_documento: '12345678', deleted: false },
      });

      expect(mockPrismaService.huesped.findFirst).toHaveBeenNthCalledWith(2, {
        where: { numero_documento: '12345678', deleted: true },
      });

      expect(mockPrismaService.huesped.update).toHaveBeenCalledWith({
        where: { id: huespedEliminadoLocal.id },
        data: {
          ...mockCreateHuespedDto,
          deleted: false,
          updatedAt: expect.any(Date),
        },
      });

      expect(mockPrismaService.huesped.create).not.toHaveBeenCalled();
    });

    it('debería crear nuevo huésped si no existe ninguno', async () => {
      // Arrange - crear objeto completamente nuevo
      const nuevoHuespedLocal = {
        id: 1,
        nombres: 'Juan Carlos',
        primer_apellido: 'Pérez',
        segundo_apellido: 'López',
        tipo_documento: TipoDoc.CC,
        numero_documento: '12345678',
        telefono: '3001234567',
        correo: 'juan.perez@email.com',
        fecha_nacimiento: new Date('1990-05-15'),
        genero: Genero.MASCULINO,
        nacionalidad: 'COLOMBIANA',
        ocupacion: 'Ingeniero',
        pais_residencia: 'Colombia',
        ciudad_residencia: 'Medellín',
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Medellín',
        lugar_nacimiento: 'Bogotá',
        deleted: false, // Explícitamente false
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      // Configurar mocks específicos para este test
      mockPrismaService.huesped.findFirst = jest
        .fn()
        .mockResolvedValueOnce(null) // Primera búsqueda: no hay huésped activo
        .mockResolvedValueOnce(null); // Segunda búsqueda: no hay huésped eliminado

      mockPrismaService.huesped.create = jest
        .fn()
        .mockResolvedValueOnce(nuevoHuespedLocal);

      // Act
      const resultado = await service.findOrCreateHuesped(mockCreateHuespedDto);

      // Assert
      expect(resultado).toEqual(nuevoHuespedLocal);
      expect(resultado.deleted).toBe(false);

      expect(mockPrismaService.huesped.findFirst).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.huesped.create).toHaveBeenCalledWith({
        data: mockCreateHuespedDto,
      });
      expect(mockPrismaService.huesped.update).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException por error de integridad P2002', async () => {
      // Arrange
      const errorPrisma = { code: 'P2002' };

      // Configurar mocks específicos para este test
      mockPrismaService.huesped.findFirst = jest
        .fn()
        .mockResolvedValueOnce(null) // Primera búsqueda: no hay huésped activo
        .mockResolvedValueOnce(null); // Segunda búsqueda: no hay huésped eliminado

      mockPrismaService.huesped.create = jest
        .fn()
        .mockRejectedValueOnce(errorPrisma);

      // Act & Assert
      await expect(
        service.findOrCreateHuesped(mockCreateHuespedDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Error de integridad: No se pudo procesar el huésped',
        ),
      );
    });
  });

  // ================================================================
  // FIND OR CREATE HUESPED TRANSACTION - Buscar o crear en transacción
  // ================================================================
  describe('findOrCreateHuespedTransaction', () => {
    it('debería devolver huésped existente en transacción', async () => {
      // Arrange
      const huespedExistente = mockHuesped;
      const mockTx = {
        huesped: {
          findFirst: jest.fn().mockResolvedValueOnce(huespedExistente),
          create: jest.fn(),
          update: jest.fn(),
        },
      } as unknown as Prisma.TransactionClient;

      // Act
      const resultado = await service.findOrCreateHuespedTransaction(
        mockCreateHuespedDto,
        mockTx,
      );

      // Assert
      expect(resultado).toEqual(huespedExistente);
      expect(mockTx.huesped.findFirst).toHaveBeenCalledWith({
        where: { numero_documento: '12345678', deleted: false },
      });
      expect(mockTx.huesped.create).not.toHaveBeenCalled();
      expect(mockTx.huesped.update).not.toHaveBeenCalled();
    });

    it('debería reactivar huésped eliminado en transacción', async () => {
      // Arrange
      const huespedEliminado = { ...mockHuesped, deleted: true };
      const huespedReactivado = { ...mockHuesped, deleted: false };

      const mockTx = {
        huesped: {
          findFirst: jest
            .fn()
            .mockResolvedValueOnce(null) // No hay huésped activo
            .mockResolvedValueOnce(huespedEliminado), // Hay huésped eliminado
          create: jest.fn(),
          update: jest.fn().mockResolvedValue(huespedReactivado),
        },
      } as unknown as Prisma.TransactionClient;

      // Act
      const resultado = await service.findOrCreateHuespedTransaction(
        mockCreateHuespedDto,
        mockTx,
      );

      // Assert
      expect(resultado).toEqual(huespedReactivado);

      expect(mockTx.huesped.update).toHaveBeenCalledWith({
        where: { id: huespedEliminado.id },
        data: {
          ...mockCreateHuespedDto,
          deleted: false,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('debería crear nuevo huésped en transacción', async () => {
      // Arrange
      const nuevoHuesped = mockHuesped;

      const mockTx = {
        huesped: {
          findFirst: jest
            .fn()
            .mockResolvedValueOnce(null) // No hay huésped activo
            .mockResolvedValueOnce(null), // No hay huésped eliminado
          create: jest.fn().mockResolvedValue(nuevoHuesped),
          update: jest.fn(),
        },
      } as unknown as Prisma.TransactionClient;

      // Act
      const resultado = await service.findOrCreateHuespedTransaction(
        mockCreateHuespedDto,
        mockTx,
      );

      // Assert
      expect(resultado).toEqual(nuevoHuesped);
      expect(mockTx.huesped.create).toHaveBeenCalledWith({
        data: mockCreateHuespedDto,
      });
    });

    it('debería lanzar BadRequestException por error P2002 en transacción', async () => {
      // Arrange
      const errorPrisma = { code: 'P2002' };

      const mockTx = {
        huesped: {
          findFirst: jest
            .fn()
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null),
          create: jest.fn().mockRejectedValue(errorPrisma),
          update: jest.fn(),
        },
      } as unknown as Prisma.TransactionClient;

      // Act & Assert
      await expect(
        service.findOrCreateHuespedTransaction(mockCreateHuespedDto, mockTx),
      ).rejects.toThrow(
        new BadRequestException(
          'Error de integridad: No se pudo procesar el huésped en la transacción',
        ),
      );
    });
  });

  // ================================================================
  // Casos de borde y validaciones adicionales
  // ================================================================
  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar múltiples operaciones concurrentes de findOrCreateHuesped', async () => {
      // Arrange
      const createDto1 = {
        ...mockCreateHuespedDto,
        numero_documento: '11111111',
      };
      const createDto2 = {
        ...mockCreateHuespedDto,
        numero_documento: '22222222',
      };
      const createDto3 = {
        ...mockCreateHuespedDto,
        numero_documento: '33333333',
      };

      let contadorConcurrente = 0;
      mockPrismaService.huesped.findFirst.mockImplementation(async () => {
        // Simular que no hay huéspedes existentes
        return null;
      });

      mockPrismaService.huesped.create.mockImplementation(async (data) => {
        contadorConcurrente++;
        return {
          ...mockHuesped,
          id: contadorConcurrente,
          numero_documento: data.data.numero_documento,
          deleted: false, // Asegurar que están activos
        };
      });

      // Act
      const promesas = [
        service.findOrCreateHuesped(createDto1),
        service.findOrCreateHuesped(createDto2),
        service.findOrCreateHuesped(createDto3),
      ];

      const resultados = await Promise.all(promesas);

      // Assert
      expect(resultados).toHaveLength(3);
      expect(resultados[0].numero_documento).toBe('11111111');
      expect(resultados[1].numero_documento).toBe('22222222');
      expect(resultados[2].numero_documento).toBe('33333333');

      // Cada operación debería haber ejecutado create
      expect(prismaService.huesped.create).toHaveBeenCalledTimes(3);
    });

    it('debería validar fechas correctamente en createHuespedDto', async () => {
      // Arrange
      const createDtoConFecha = {
        ...mockCreateHuespedDto,
        fecha_nacimiento: new Date('1985-12-25T00:00:00Z'),
      };

      const huespedConFecha = {
        ...mockHuesped,
        fecha_nacimiento: createDtoConFecha.fecha_nacimiento,
      };

      mockPrismaService.huesped.create.mockResolvedValue(huespedConFecha);

      // Act
      const resultado = await service.create(createDtoConFecha);

      // Assert
      expect(resultado.fecha_nacimiento).toEqual(
        createDtoConFecha.fecha_nacimiento,
      );
      expect(resultado.fecha_nacimiento).toBeInstanceOf(Date);
      expect(prismaService.huesped.create).toHaveBeenCalledWith({
        data: createDtoConFecha,
      });
    });

    it('debería manejar documentos con caracteres especiales', async () => {
      // Arrange
      const documentoEspecial = 'CC-12.345.678-9';
      const createDtoEspecial = {
        ...mockCreateHuespedDto,
        numero_documento: documentoEspecial,
      };

      mockPrismaService.huesped.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockPrismaService.huesped.create.mockResolvedValue({
        ...mockHuesped,
        numero_documento: documentoEspecial,
      });

      // Act
      const resultado = await service.findOrCreateHuesped(createDtoEspecial);

      // Assert
      expect(resultado.numero_documento).toBe(documentoEspecial);
      expect(prismaService.huesped.findFirst).toHaveBeenCalledWith({
        where: { numero_documento: documentoEspecial, deleted: false },
      });
    });

    it('debería mantener la integridad de datos en actualizaciones parciales', async () => {
      // Arrange
      const huespedId = 1;
      const updateParcial = { telefono: '3001111111' };
      const huespedActualizado = { ...mockHuesped, telefono: '3001111111' };

      mockPrismaService.huesped.update.mockResolvedValue(huespedActualizado);

      // Act
      const resultado = await service.update(huespedId, updateParcial);

      // Assert
      expect(resultado).toEqual(huespedActualizado);
      expect(prismaService.huesped.update).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        data: updateParcial,
      });

      // Verificar que solo se actualizado el campo especificado
      expect(resultado.nombres).toBe(mockHuesped.nombres); // Otros campos no cambiaron
      expect(resultado.telefono).toBe('3001111111'); // Solo este cambió
    });
  });
});
