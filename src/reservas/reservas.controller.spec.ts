import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { EstadosReserva } from 'src/common/enums/estadosReserva.enum';
import { MotivosViajes } from 'src/common/enums/motivosViajes.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';

describe('ReservasController', () => {
  let controller: ReservasController;
  let service: ReservasService;

  // Mock del ReservasService
  const mockReservasService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Datos de prueba
  const mockCreateReservaDto: CreateReservaDto = {
    fecha_inicio: new Date('2024-01-15'),
    fecha_fin: new Date('2024-01-20'),
    estado: EstadosReserva.RESERVADO,
    pais_procedencia: 'Colombia',
    ciudad_procedencia: 'Medellín',
    pais_destino: 'Estados Unidos',
    motivo_viaje: MotivosViajes.COMPRAS,
    check_in: new Date('2024-01-15T14:00:00'),
    check_out: new Date('2024-01-20T12:00:00'),
    costo: 500.5,
    numero_acompaniantes: 2,
    habitacionId: 101,
    huespedId: 1,
  };

  const mockReservaResponse = {
    id: 1,
    ...mockCreateReservaDto,
    facturaId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deleted: false,
  };

  const mockPaginationDto: PaginationDto = {
    page: 1,
    limit: 10,
  };

  const mockPaginatedResponse = {
    data: [mockReservaResponse],
    meta: {
      page: 1,
      limit: 10,
      totalReservas: 1,
      lastPage: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [
        {
          provide: ReservasService,
          useValue: mockReservasService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReservasController>(ReservasController);
    service = module.get<ReservasService>(ReservasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================================================================
  // DEFINICIÓN DEL CONTROLLER
  // ================================================================
  describe('Definición del controller', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener todas las dependencias inyectadas', () => {
      expect(service).toBeDefined();
    });
  });

  // ================================================================
  // CREATE - Crear nueva reserva
  // ================================================================
  describe('create', () => {
    it('debería llamar al servicio create con los datos correctos', async () => {
      // Arrange
      mockReservasService.create.mockResolvedValue(mockReservaResponse);

      // Act
      const result = await controller.create(mockCreateReservaDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockCreateReservaDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReservaResponse);
    });

    it('debería propagar errores del servicio', async () => {
      // Arrange
      const errorMessage = 'Error al crear reserva';
      mockReservasService.create.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.create(mockCreateReservaDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateReservaDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  // ================================================================
  // FIND ALL - Obtener todas las reservas
  // ================================================================
  describe('findAll', () => {
    it('debería llamar al servicio findAll con parámetros de paginación', async () => {
      // Arrange
      mockReservasService.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await controller.findAll(mockPaginationDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(mockPaginationDto);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('debería manejar respuesta vacía del servicio', async () => {
      // Arrange
      const emptyResponse = {
        data: [],
        meta: { page: 1, limit: 10, totalReservas: 0, lastPage: 0 },
      };
      mockReservasService.findAll.mockResolvedValue(emptyResponse);

      // Act
      const result = await controller.findAll(mockPaginationDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual(emptyResponse);
      expect(result.data).toHaveLength(0);
    });

    it('debería propagar errores del servicio', async () => {
      // Arrange
      const errorMessage = 'Error al obtener reservas';
      mockReservasService.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.findAll(mockPaginationDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.findAll).toHaveBeenCalledWith(mockPaginationDto);
    });
  });

  // ================================================================
  // FIND ONE - Buscar reserva por ID
  // ================================================================
  describe('findOne', () => {
    it('debería llamar al servicio findOne con el ID correcto', async () => {
      // Arrange
      const reservaId = 1;
      mockReservasService.findOne.mockResolvedValue(mockReservaResponse);

      // Act
      const result = await controller.findOne(reservaId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(reservaId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReservaResponse);
    });

    it('debería propagar NotFoundException del servicio', async () => {
      // Arrange
      const reservaId = 999;
      const errorMessage = 'Reserva no encontrada';
      mockReservasService.findOne.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.findOne(reservaId)).rejects.toThrow(errorMessage);
      expect(service.findOne).toHaveBeenCalledWith(reservaId);
    });
  });

  // ================================================================
  // UPDATE - Actualizar reserva
  // ================================================================
  describe('update', () => {
    const updateDto: UpdateReservaDto = {
      estado: EstadosReserva.FINALIZADO,
      costo: 750.0,
    };

    const updatedReserva = {
      ...mockReservaResponse,
      ...updateDto,
      updatedAt: new Date('2024-01-02'),
    };

    it('debería llamar al servicio update con ID y datos correctos', async () => {
      // Arrange
      const reservaId = 1;
      mockReservasService.update.mockResolvedValue(updatedReserva);

      // Act
      const result = await controller.update(reservaId, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(reservaId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedReserva);
    });

    it('debería propagar BadRequestException cuando no hay datos', async () => {
      // Arrange
      const reservaId = 1;
      const emptyDto = {};
      const errorMessage = 'Debe enviar datos para actualizar';
      mockReservasService.update.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.update(reservaId, emptyDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.update).toHaveBeenCalledWith(reservaId, emptyDto);
    });

    it('debería propagar NotFoundException del servicio', async () => {
      // Arrange
      const reservaId = 999;
      const errorMessage = 'Reserva no encontrada';
      mockReservasService.update.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.update(reservaId, updateDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.update).toHaveBeenCalledWith(reservaId, updateDto);
    });
  });

  // ================================================================
  // DELETE - Eliminar reserva (con cascada)
  // ================================================================
  describe('remove', () => {
    it('debería llamar al servicio remove con el ID correcto', async () => {
      // Arrange
      const reservaId = 1;
      const deletedReserva = { ...mockReservaResponse, deleted: true };
      mockReservasService.remove.mockResolvedValue(deletedReserva);

      // Act
      const result = await controller.remove(reservaId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(reservaId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedReserva);
    });

    it('debería propagar NotFoundException del servicio', async () => {
      // Arrange
      const reservaId = 999;
      const errorMessage = 'Reserva no encontrada';
      mockReservasService.remove.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.remove(reservaId)).rejects.toThrow(errorMessage);
      expect(service.remove).toHaveBeenCalledWith(reservaId);
    });

    it('debería manejar errores de eliminación en cascada', async () => {
      // Arrange
      const reservaId = 1;
      const errorMessage = 'Error durante la eliminación en cascada';
      mockReservasService.remove.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.remove(reservaId)).rejects.toThrow(errorMessage);
      expect(service.remove).toHaveBeenCalledWith(reservaId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  // ================================================================
  // VALIDACIONES DE TIPOS Y PARÁMETROS
  // ================================================================
  describe('Validaciones de tipos y parámetros', () => {
    it('debería manejar diferentes tipos de IDs numéricos', async () => {
      // Arrange
      const ids = [1, 42, 999];
      mockReservasService.findOne.mockResolvedValue(mockReservaResponse);

      // Act & Assert
      for (const id of ids) {
        await controller.findOne(id);
        expect(service.findOne).toHaveBeenCalledWith(id);
      }

      expect(service.findOne).toHaveBeenCalledTimes(ids.length);
    });

    it('debería validar diferentes estados de reserva en creación', async () => {
      // Arrange
      const estados = Object.values(EstadosReserva);
      mockReservasService.create.mockResolvedValue(mockReservaResponse);

      // Act & Assert
      for (const estado of estados) {
        const reservaDto = { ...mockCreateReservaDto, estado };
        await controller.create(reservaDto);
        expect(service.create).toHaveBeenCalledWith(reservaDto);
      }
    });

    it('debería validar diferentes motivos de viaje', async () => {
      // Arrange
      const motivos = Object.values(MotivosViajes);
      mockReservasService.create.mockResolvedValue(mockReservaResponse);

      // Act & Assert
      for (const motivo of motivos) {
        const reservaDto = { ...mockCreateReservaDto, motivo_viaje: motivo };
        await controller.create(reservaDto);
        expect(service.create).toHaveBeenCalledWith(reservaDto);
      }
    });

    it('debería manejar diferentes parámetros de paginación', async () => {
      // Arrange
      const paginationOptions = [
        { page: 1, limit: 5 },
        { page: 2, limit: 20 },
        { page: 10, limit: 50 },
      ];
      mockReservasService.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act & Assert
      for (const pagination of paginationOptions) {
        await controller.findAll(pagination);
        expect(service.findAll).toHaveBeenCalledWith(pagination);
      }

      expect(service.findAll).toHaveBeenCalledTimes(paginationOptions.length);
    });
  });

  // ================================================================
  // INTEGRACIÓN CON SWAGGER/DOCUMENTACIÓN
  // ================================================================
  describe('Integración con documentación API', () => {
    it('debería retornar estructuras que cumplen con Swagger para creación', async () => {
      // Arrange
      mockReservasService.create.mockResolvedValue(mockReservaResponse);

      // Act
      const result = await controller.create(mockCreateReservaDto);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fecha_inicio');
      expect(result).toHaveProperty('fecha_fin');
      expect(result).toHaveProperty('estado');
      expect(result).toHaveProperty('costo');
      expect(result).toHaveProperty('habitacionId');
      expect(result).toHaveProperty('huespedId');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('deleted');
    });

    it('debería retornar estructuras que cumplen con Swagger para paginación', async () => {
      // Arrange
      mockReservasService.findAll.mockResolvedValue(mockPaginatedResponse);

      // Act
      const result = await controller.findAll(mockPaginationDto);

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('page');
      expect(result.meta).toHaveProperty('limit');
      expect(result.meta).toHaveProperty('totalReservas');
      expect(result.meta).toHaveProperty('lastPage');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('debería retornar estructuras que cumplen con Swagger para búsqueda individual', async () => {
      // Arrange
      mockReservasService.findOne.mockResolvedValue(mockReservaResponse);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toEqual(mockReservaResponse);
      expect(typeof result.id).toBe('number');
      expect(result.deleted).toBe(false);
    });

    it('debería retornar estructuras que cumplen con Swagger para actualización', async () => {
      // Arrange
      const updateDto: UpdateReservaDto = { costo: 800.0 };
      const updatedReserva = { ...mockReservaResponse, ...updateDto };
      mockReservasService.update.mockResolvedValue(updatedReserva);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result).toEqual(updatedReserva);
      expect(result.costo).toBe(800.0);
      expect(result).toHaveProperty('updatedAt');
    });

    it('debería retornar estructuras que cumplen con Swagger para eliminación', async () => {
      // Arrange
      const deletedReserva = { ...mockReservaResponse, deleted: true };
      mockReservasService.remove.mockResolvedValue(deletedReserva);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(result).toEqual(deletedReserva);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('deleted');
    });
  });

  // ================================================================
  // CASOS DE BORDE Y COMPORTAMIENTO ESPECÍFICO
  // ================================================================
  describe('Casos de borde y comportamiento específico', () => {
    it('debería manejar múltiples llamadas concurrentes', async () => {
      // Arrange
      mockReservasService.findOne.mockResolvedValue(mockReservaResponse);
      const promises = [];

      // Act
      for (let i = 1; i <= 5; i++) {
        promises.push(controller.findOne(i));
      }
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(5);
      expect(service.findOne).toHaveBeenCalledTimes(5);
      results.forEach((result) => {
        expect(result).toEqual(mockReservaResponse);
      });
    });

    it('debería mantener la integridad de datos entre llamadas', async () => {
      // Arrange
      const createDto1 = { ...mockCreateReservaDto, habitacionId: 101 };
      const createDto2 = { ...mockCreateReservaDto, habitacionId: 102 };

      const response1 = { ...mockReservaResponse, habitacionId: 101 };
      const response2 = { ...mockReservaResponse, id: 2, habitacionId: 102 };

      mockReservasService.create
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2);

      // Act
      const result1 = await controller.create(createDto1);
      const result2 = await controller.create(createDto2);

      // Assert
      expect(result1.habitacionId).toBe(101);
      expect(result2.habitacionId).toBe(102);
      expect(service.create).toHaveBeenCalledTimes(2);
      expect(service.create).toHaveBeenNthCalledWith(1, createDto1);
      expect(service.create).toHaveBeenNthCalledWith(2, createDto2);
    });

    it('debería validar que los parámetros se pasan correctamente sin mutación', async () => {
      // Arrange
      const originalDto = { ...mockCreateReservaDto };
      const dtoClone = { ...mockCreateReservaDto };
      mockReservasService.create.mockResolvedValue(mockReservaResponse);

      // Act
      await controller.create(dtoClone);

      // Assert
      expect(dtoClone).toEqual(originalDto); // Verificar que no se mutó
      expect(service.create).toHaveBeenCalledWith(dtoClone);
    });
  });
});
