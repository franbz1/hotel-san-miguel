import { Test, TestingModule } from '@nestjs/testing';
import { LinkFormularioService } from './link-formulario.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from 'src/auth/blacklist.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('LinkFormularioService', () => {
  let service: LinkFormularioService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let blacklistService: BlacklistService;

  // Mock del PrismaService
  const mockPrismaService = {
    habitacion: {
      findFirstOrThrow: jest.fn(),
    },
    linkFormulario: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Mock del JwtService
  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  // Mock del BlacklistService
  const mockBlacklistService = {
    addToBlacklist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkFormularioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: BlacklistService,
          useValue: mockBlacklistService,
        },
      ],
    }).compile();

    service = module.get<LinkFormularioService>(LinkFormularioService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    blacklistService = module.get<BlacklistService>(BlacklistService);
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
      expect(jwtService).toBeDefined();
      expect(blacklistService).toBeDefined();
    });
  });

  describe('createLinkTemporal', () => {
    it('debería crear un link temporal exitosamente', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 101,
        fechaInicio: new Date('2024-01-15'),
        fechaFin: new Date('2024-01-20'),
        costo: 500,
      };

      const habitacionEncontrada = {
        id: 1,
        numero_habitacion: 101,
        deleted: false,
      };

      const linkCreado = {
        id: 1,
        url: 'http://localhost:3000/registro-formulario/temp-token',
        vencimiento: new Date(),
        numeroHabitacion: 101,
        fechaInicio: createLinkDto.fechaInicio,
        fechaFin: createLinkDto.fechaFin,
        costo: 500,
      };

      const tokenGenerado = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const urlFinal = `http://localhost:3000/registro-formulario/${tokenGenerado}`;

      const linkActualizado = {
        ...linkCreado,
        url: urlFinal,
      };

      // Mock de la transacción
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          habitacion: {
            findFirstOrThrow: jest.fn().mockResolvedValue(habitacionEncontrada),
          },
          linkFormulario: {
            create: jest.fn().mockResolvedValue(linkCreado),
            update: jest.fn().mockResolvedValue(linkActualizado),
          },
        };
        return await callback(mockTx);
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce('temp-token') // Primer llamada con ID temporal
        .mockResolvedValueOnce(tokenGenerado); // Segunda llamada con ID real

      // Act
      const resultado = await service.createLinkTemporal(createLinkDto);

      // Assert
      expect(resultado).toBe(urlFinal);

      // Verificar que se ejecutó la transacción
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);

      // Verificar que se generaron 2 tokens (temporal y final)
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('debería lanzar error cuando la habitación no existe', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 999,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        costo: 100,
      };

      const errorPrisma = { code: 'P2025' };

      // Mock de la transacción que falla
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          habitacion: {
            findFirstOrThrow: jest.fn().mockRejectedValue(errorPrisma),
          },
          linkFormulario: {
            create: jest.fn(),
            update: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      // Act & Assert
      await expect(service.createLinkTemporal(createLinkDto)).rejects.toThrow();
    });

    it('debería propagar errores que no sean P2025', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 101,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        costo: 100,
      };

      const errorGenerico = new Error('Error de conexión');

      // Mock de la transacción que falla
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          habitacion: {
            findFirstOrThrow: jest.fn().mockRejectedValue(errorGenerico),
          },
          linkFormulario: {
            create: jest.fn(),
            update: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      // Act & Assert
      await expect(service.createLinkTemporal(createLinkDto)).rejects.toThrow(
        'Error de conexión',
      );
    });

    it('debería calcular vencimiento de 1 hora correctamente', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 101,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        costo: 100,
      };

      const habitacion = { numero_habitacion: 101 };
      const linkCreado = {
        id: 1,
        url: 'http://localhost:3000/registro-formulario/temp-token',
      };
      const linkActualizado = {
        url: 'http://localhost:3000/registro-formulario/final-token',
      };

      // Mock de la transacción
      let capturedCreateData;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          habitacion: {
            findFirstOrThrow: jest.fn().mockResolvedValue(habitacion),
          },
          linkFormulario: {
            create: jest.fn().mockImplementation(async (data) => {
              capturedCreateData = data;
              return linkCreado;
            }),
            update: jest.fn().mockResolvedValue(linkActualizado),
          },
        };
        return await callback(mockTx);
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce('temp-token')
        .mockResolvedValueOnce('final-token');

      // Act
      await service.createLinkTemporal(createLinkDto);

      // Assert
      const vencimiento = capturedCreateData.data.vencimiento;

      // Verificar que el vencimiento está aproximadamente 1 hora en el futuro
      const ahora = new Date();
      const unHoraEnMs = 60 * 60 * 1000;
      const diferencia = vencimiento.getTime() - ahora.getTime();

      expect(diferencia).toBeGreaterThan(unHoraEnMs - 1000); // -1s tolerancia
      expect(diferencia).toBeLessThan(unHoraEnMs + 1000); // +1s tolerancia
    });
  });

  describe('findAll', () => {
    it('debería obtener links con paginación exitosamente', async () => {
      // Arrange
      const paginationDto = { page: 1, limit: 10 };
      const linksEncontrados = [
        { id: 1, url: 'url1', completado: false },
        { id: 2, url: 'url2', completado: true },
      ];

      mockPrismaService.linkFormulario.count.mockResolvedValue(2);
      mockPrismaService.linkFormulario.findMany.mockResolvedValue(
        linksEncontrados,
      );

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado).toEqual({
        data: linksEncontrados,
        meta: { page: 1, limit: 10, totalLinks: 2, lastPage: 1 },
      });

      expect(prismaService.linkFormulario.count).toHaveBeenCalledWith({
        where: { deleted: false },
      });

      expect(prismaService.linkFormulario.findMany).toHaveBeenCalledWith({
        skip: 0, // (page - 1) * limit
        take: 10,
        where: { deleted: false },
        orderBy: { fechaInicio: 'desc' },
      });
    });

    it('debería calcular paginación correctamente', async () => {
      // Arrange
      const paginationDto = { page: 3, limit: 5 };

      mockPrismaService.linkFormulario.count.mockResolvedValue(15);
      mockPrismaService.linkFormulario.findMany.mockResolvedValue([]);

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado.meta).toEqual({
        page: 3,
        limit: 5,
        totalLinks: 15,
        lastPage: 3, // Math.ceil(15 / 5)
      });

      expect(prismaService.linkFormulario.findMany).toHaveBeenCalledWith({
        skip: 10, // (3 - 1) * 5
        take: 5,
        where: { deleted: false },
        orderBy: { fechaInicio: 'desc' },
      });
    });

    it('debería retornar respuesta vacía cuando no hay datos', async () => {
      // Arrange
      const paginationDto = { page: 1, limit: 10 };

      mockPrismaService.linkFormulario.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.lastPage).toBe(0);

      // Verificar que NO se ejecutó findMany cuando totalLinks es 0
      expect(prismaService.linkFormulario.findMany).not.toHaveBeenCalled();
    });

    it('debería retornar respuesta vacía cuando page excede lastPage', async () => {
      // Arrange
      const paginationDto = { page: 5, limit: 10 };

      mockPrismaService.linkFormulario.count.mockResolvedValue(20); // lastPage = 2

      // Act
      const resultado = await service.findAll(paginationDto);

      // Assert
      expect(resultado.data).toEqual([]);
      expect(resultado.meta.page).toBe(5);
      expect(resultado.meta.lastPage).toBe(2);

      // Verificar que NO se ejecutó findMany cuando page > lastPage
      expect(prismaService.linkFormulario.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería encontrar un link por ID exitosamente', async () => {
      // Arrange
      const linkId = 1;
      const linkEncontrado = {
        id: 1,
        url: 'https://example.com/token',
        completado: false,
        expirado: false,
      };

      mockPrismaService.linkFormulario.findFirstOrThrow.mockResolvedValue(
        linkEncontrado,
      );

      // Act
      const resultado = await service.findOne(linkId);

      // Assert
      expect(resultado).toEqual(linkEncontrado);
      expect(
        prismaService.linkFormulario.findFirstOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
      });
    });

    it('debería lanzar error cuando el link no existe', async () => {
      // Arrange
      const linkId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.linkFormulario.findFirstOrThrow.mockRejectedValue(
        errorPrisma,
      );

      // Act & Assert
      await expect(service.findOne(linkId)).rejects.toThrow();
      expect(
        prismaService.linkFormulario.findFirstOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 999, deleted: false },
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar un link exitosamente', async () => {
      // Arrange
      const linkId = 1;
      const linkEliminado = {
        id: 1,
        url: 'https://example.com/registro-formulario/token123',
        deleted: true,
      };

      mockPrismaService.linkFormulario.update.mockResolvedValue(linkEliminado);

      // Act
      const resultado = await service.remove(linkId);

      // Assert
      expect(resultado).toEqual(linkEliminado);

      expect(prismaService.linkFormulario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted: true },
      });

      // Verificar que se añadió el token a la blacklist
      expect(blacklistService.addToBlacklist).toHaveBeenCalledWith('token123');
    });

    it('debería manejar URLs sin token correctamente', async () => {
      // Arrange
      const linkId = 1;
      const linkSinToken = {
        id: 1,
        url: 'https://example.com/',
        deleted: true,
      };

      mockPrismaService.linkFormulario.update.mockResolvedValue(linkSinToken);

      // Act
      await service.remove(linkId);

      // Assert
      // Verificar que se intentó añadir undefined/empty a blacklist
      expect(blacklistService.addToBlacklist).toHaveBeenCalledWith('');
    });

    it('debería lanzar error cuando el link no existe para eliminación', async () => {
      // Arrange
      const linkId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.linkFormulario.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.remove(linkId)).rejects.toThrow();
      expect(prismaService.linkFormulario.update).toHaveBeenCalledWith({
        where: { id: 999 },
        data: { deleted: true },
      });

      // Verificar que NO se llamó blacklist en caso de error
      expect(blacklistService.addToBlacklist).not.toHaveBeenCalled();
    });
  });

  describe('removeTx', () => {
    it('debería eliminar un link en transacción exitosamente', async () => {
      // Arrange
      const linkId = 1;
      const mockTx = {
        linkFormulario: {
          update: jest.fn(),
        },
      };
      const linkEliminado = {
        id: 1,
        url: 'https://example.com/registro-formulario/token456',
        deleted: true,
      };

      mockTx.linkFormulario.update.mockResolvedValue(linkEliminado);

      // Act
      const resultado = await service.removeTx(linkId, mockTx as any);

      // Assert
      expect(resultado).toEqual(linkEliminado);

      expect(mockTx.linkFormulario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted: true },
      });

      // Verificar que se añadió el token a la blacklist
      expect(blacklistService.addToBlacklist).toHaveBeenCalledWith('token456');
    });

    it('debería manejar errores en transacción', async () => {
      // Arrange
      const linkId = 1;
      const mockTx = {
        linkFormulario: {
          update: jest.fn(),
        },
      };
      const errorPrisma = { code: 'P2025' };

      mockTx.linkFormulario.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.removeTx(linkId, mockTx as any)).rejects.toThrow();

      // Verificar que NO se llamó blacklist en caso de error
      expect(blacklistService.addToBlacklist).not.toHaveBeenCalled();
    });
  });

  describe('regenerateLink', () => {
    it('debería regenerar un link exitosamente', async () => {
      // Arrange
      const linkId = 1;
      const linkExistente = {
        id: 1,
        url: 'http://localhost:3000/registro-formulario/old-token',
        completado: false,
        expirado: false,
      };

      const tokenNuevo = 'new-token-123';
      const linkRegenerado = {
        ...linkExistente,
        url: `http://localhost:3000/registro-formulario/${tokenNuevo}`,
        vencimiento: new Date(),
        expirado: false,
      };

      mockPrismaService.linkFormulario.findFirstOrThrow.mockResolvedValue(
        linkExistente,
      );
      mockJwtService.signAsync.mockResolvedValue(tokenNuevo);
      mockPrismaService.linkFormulario.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.linkFormulario.findFirstOrThrow
        .mockResolvedValueOnce(linkExistente) // Primera llamada en findOne
        .mockResolvedValueOnce(linkRegenerado); // Segunda llamada al final

      // Act
      const resultado = await service.regenerateLink(linkId);

      // Assert
      expect(resultado).toEqual(linkRegenerado);

      // Verificar que se añadió el token viejo a blacklist
      expect(blacklistService.addToBlacklist).toHaveBeenCalledWith('old-token');

      // Verificar generación del nuevo token
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          id: 1,
          rol: 'REGISTRO_FORMULARIO',
        },
        {
          expiresIn: '1h',
        },
      );

      // Verificar actualización atómica del link
      expect(prismaService.linkFormulario.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          completado: false,
        },
        data: {
          url: `http://localhost:3000/registro-formulario/${tokenNuevo}`,
          vencimiento: expect.any(Date),
          expirado: false,
        },
      });
    });

    it('debería lanzar error cuando el link ya está completado', async () => {
      // Arrange
      const linkId = 1;
      const linkCompletado = {
        id: 1,
        completado: true,
      };

      mockPrismaService.linkFormulario.findFirstOrThrow.mockResolvedValue(
        linkCompletado,
      );

      // Act & Assert
      await expect(service.regenerateLink(linkId)).rejects.toThrow(
        BadRequestException,
      );

      // Verificar que NO se regeneró el token
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(prismaService.linkFormulario.updateMany).not.toHaveBeenCalled();
    });

    it('debería lanzar error cuando updateMany retorna count 0', async () => {
      // Arrange
      const linkId = 1;
      const linkExistente = {
        id: 1,
        url: 'http://localhost:3000/registro-formulario/old-token',
        completado: false,
        expirado: false,
      };

      mockPrismaService.linkFormulario.findFirstOrThrow.mockResolvedValue(
        linkExistente,
      );
      mockJwtService.signAsync.mockResolvedValue('new-token');
      mockPrismaService.linkFormulario.updateMany.mockResolvedValue({
        count: 0, // Simula que no se actualizó ningún registro
      });

      // Act & Assert
      await expect(service.regenerateLink(linkId)).rejects.toThrow(
        'El link ya ha sido completado o no existe',
      );
    });

    it('debería lanzar error cuando el link no existe', async () => {
      // Arrange
      const linkId = 999;
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.linkFormulario.findFirstOrThrow.mockRejectedValue(
        errorPrisma,
      );

      // Act & Assert
      await expect(service.regenerateLink(linkId)).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('debería validar un token exitosamente', async () => {
      // Arrange
      const token = 'valid-token';
      const payloadEsperado = {
        id: 1,
        rol: 'REGISTRO_FORMULARIO',
        iat: 1640995200,
        exp: 1640998800,
      };

      mockJwtService.verifyAsync.mockResolvedValue(payloadEsperado);

      // Act
      const resultado = await service.validateToken(token);

      // Assert
      expect(resultado).toEqual(payloadEsperado);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
    });

    it('debería lanzar UnauthorizedException cuando el token es inválido', async () => {
      // Arrange
      const token = 'invalid-token';
      const errorJwt = new Error('Invalid token');

      mockJwtService.verifyAsync.mockRejectedValue(errorJwt);

      // Act & Assert
      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token);
    });

    it('debería lanzar UnauthorizedException para cualquier error de verificación', async () => {
      // Arrange
      const token = 'token';
      const errores = [
        new Error('Token expired'),
        new Error('Malformed token'),
        new Error('Secret mismatch'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockJwtService.verifyAsync.mockRejectedValue(error);

        await expect(service.validateToken(token)).rejects.toThrow(
          UnauthorizedException,
        );
      }

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(errores.length);
    });
  });

  describe('findAllByHabitacion', () => {
    it('debería obtener links por habitación con paginación exitosamente', async () => {
      // Arrange
      const numeroHabitacion = 101;
      const paginationDto = { page: 1, limit: 5 };
      const linksEncontrados = [
        { id: 1, numeroHabitacion: 101, completado: false },
        { id: 2, numeroHabitacion: 101, completado: true },
      ];

      mockPrismaService.linkFormulario.count.mockResolvedValue(2);
      mockPrismaService.linkFormulario.findMany.mockResolvedValue(
        linksEncontrados,
      );

      // Act
      const resultado = await service.findAllByHabitacion(
        numeroHabitacion,
        paginationDto,
      );

      // Assert
      expect(resultado).toEqual({
        data: linksEncontrados,
        meta: { page: 1, limit: 5, totalLinks: 2, lastPage: 1 },
      });

      expect(prismaService.linkFormulario.count).toHaveBeenCalledWith({
        where: {
          numeroHabitacion: 101,
          deleted: false,
        },
      });

      expect(prismaService.linkFormulario.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        where: {
          numeroHabitacion: 101,
          deleted: false,
        },
      });
    });

    it('debería retornar respuesta vacía para habitación sin links', async () => {
      // Arrange
      const numeroHabitacion = 999;
      const paginationDto = { page: 1, limit: 10 };

      mockPrismaService.linkFormulario.count.mockResolvedValue(0);

      // Act
      const resultado = await service.findAllByHabitacion(
        numeroHabitacion,
        paginationDto,
      );

      // Assert
      expect(resultado.data).toEqual([]);

      // Verificar que NO se ejecutó findMany cuando totalLinks es 0
      expect(prismaService.linkFormulario.findMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar un link exitosamente', async () => {
      // Arrange
      const linkId = 1;
      const updateDto = {
        completado: true,
        expirado: false,
      };
      const linkActualizado = {
        id: 1,
        completado: true,
        expirado: false,
      };

      mockPrismaService.linkFormulario.update.mockResolvedValue(
        linkActualizado,
      );

      // Act
      const resultado = await service.update(linkId, updateDto);

      // Assert
      expect(resultado).toEqual(linkActualizado);
      expect(prismaService.linkFormulario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('debería lanzar error cuando el link no existe para actualización', async () => {
      // Arrange
      const linkId = 999;
      const updateDto = { completado: true };
      const errorPrisma = { code: 'P2025' };

      mockPrismaService.linkFormulario.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.update(linkId, updateDto)).rejects.toThrow();
    });
  });

  describe('UpdateTransaction', () => {
    it('debería actualizar un link en transacción exitosamente', async () => {
      // Arrange
      const linkId = 1;
      const updateDto = { completado: true };
      const mockTx = {
        linkFormulario: {
          update: jest.fn(),
        },
      };
      const linkActualizado = {
        id: 1,
        completado: true,
      };

      mockTx.linkFormulario.update.mockResolvedValue(linkActualizado);

      // Act
      const resultado = await service.UpdateTransaction(
        updateDto,
        mockTx as any,
        linkId,
      );

      // Assert
      expect(resultado).toEqual(linkActualizado);
      expect(mockTx.linkFormulario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('debería lanzar error en transacción para actualización', async () => {
      // Arrange
      const linkId = 999;
      const updateDto = { completado: true };
      const mockTx = {
        linkFormulario: {
          update: jest.fn(),
        },
      };
      const errorPrisma = { code: 'P2025' };

      mockTx.linkFormulario.update.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(
        service.UpdateTransaction(updateDto, mockTx as any, linkId),
      ).rejects.toThrow();
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar múltiples operaciones concurrentes de createLinkTemporal', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 101,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        costo: 100,
      };

      const habitacion = { numero_habitacion: 101 };
      let linkIdCounter = 1;

      // Mock de transacciones concurrentes
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const currentId = linkIdCounter++;
        const mockTx = {
          habitacion: {
            findFirstOrThrow: jest.fn().mockResolvedValue(habitacion),
          },
          linkFormulario: {
            create: jest.fn().mockResolvedValue({
              id: currentId,
              url: `http://localhost:3000/registro-formulario/temp-token-${currentId}`,
            }),
            update: jest.fn().mockResolvedValue({
              id: currentId,
              url: `http://localhost:3000/registro-formulario/final-token-${currentId}`,
            }),
          },
        };
        return await callback(mockTx);
      });

      mockJwtService.signAsync.mockImplementation(
        async (payload) => `token-${payload.id}`,
      );

      // Act
      const promesas = [
        service.createLinkTemporal(createLinkDto),
        service.createLinkTemporal(createLinkDto),
        service.createLinkTemporal(createLinkDto),
      ];

      const resultados = await Promise.all(promesas);

      // Assert
      expect(resultados).toHaveLength(3);
      expect(resultados[0]).toContain('final-token-1');
      expect(resultados[1]).toContain('final-token-2');
      expect(resultados[2]).toContain('final-token-3');

      // Cada operación debería haber ejecutado una transacción
      expect(prismaService.$transaction).toHaveBeenCalledTimes(3);
    });

    it('debería manejar tokens con caracteres especiales en URLs', async () => {
      // Arrange
      const linkId = 1;
      const linkConTokenEspecial = {
        id: 1,
        url: 'https://example.com/registro-formulario/token.with-special_chars',
        deleted: true,
      };

      mockPrismaService.linkFormulario.update.mockResolvedValue(
        linkConTokenEspecial,
      );

      // Act
      await service.remove(linkId);

      // Assert
      expect(blacklistService.addToBlacklist).toHaveBeenCalledWith(
        'token.with-special_chars',
      );
    });

    it('debería validar el formato de fechas en createLinkTemporal', async () => {
      // Arrange
      const createLinkDto = {
        numeroHabitacion: 101,
        fechaInicio: new Date('2024-01-15T10:00:00Z'),
        fechaFin: new Date('2024-01-20T15:30:00Z'),
        costo: 500,
      };

      const habitacion = { numero_habitacion: 101 };
      const linkCreado = {
        id: 1,
        url: 'http://localhost:3000/registro-formulario/temp-token',
      };
      const linkActualizado = {
        url: 'http://localhost:3000/registro-formulario/final-token',
      };

      // Mock de la transacción
      let capturedCreateData;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          habitacion: {
            findFirstOrThrow: jest.fn().mockResolvedValue(habitacion),
          },
          linkFormulario: {
            create: jest.fn().mockImplementation(async (data) => {
              capturedCreateData = data;
              return linkCreado;
            }),
            update: jest.fn().mockResolvedValue(linkActualizado),
          },
        };
        return await callback(mockTx);
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce('temp-token')
        .mockResolvedValueOnce('final-token');

      // Act
      await service.createLinkTemporal(createLinkDto);

      // Assert
      expect(capturedCreateData.data.fechaInicio).toEqual(
        createLinkDto.fechaInicio,
      );
      expect(capturedCreateData.data.fechaFin).toEqual(createLinkDto.fechaFin);
      expect(capturedCreateData.data.fechaInicio).toBeInstanceOf(Date);
      expect(capturedCreateData.data.fechaFin).toBeInstanceOf(Date);
    });
  });
});
