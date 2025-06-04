import { Test, TestingModule } from '@nestjs/testing';
import { HuespedesController } from './huespedes.controller';
import { HuespedesService } from './huespedes.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateHuespedDto } from './dto/create-huesped.dto';
import { UpdateHuespedDto } from './dto/update-huesped.dto';
import { PaginationDto } from 'src/common/dtos/paginationDto';
import { TipoDoc } from 'src/common/enums/tipoDoc.enum';
import { Genero } from 'src/common/enums/generos.enum';

describe('HuespedesController', () => {
  let controller: HuespedesController;
  let huespedesService: HuespedesService;

  // Mock del HuespedesService
  const mockHuespedesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDocumentoId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Datos mock para las pruebas
  const mockCreateHuespedDto: CreateHuespedDto = {
    nombres: 'Juan Carlos',
    primer_apellido: 'Pérez',
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuespedesController],
      providers: [
        {
          provide: HuespedesService,
          useValue: mockHuespedesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<HuespedesController>(HuespedesController);
    huespedesService = module.get<HuespedesService>(HuespedesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controller', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener el servicio inyectado', () => {
      expect(huespedesService).toBeDefined();
    });
  });

  // ================================================================
  // CREATE - Crear huésped
  // ================================================================
  describe('create', () => {
    it('debería crear un huésped exitosamente', async () => {
      // Arrange
      mockHuespedesService.create.mockResolvedValue(mockHuesped);

      // Act
      const resultado = await controller.create(mockCreateHuespedDto);

      // Assert
      expect(resultado).toEqual(mockHuesped);
      expect(huespedesService.create).toHaveBeenCalledTimes(1);
      expect(huespedesService.create).toHaveBeenCalledWith(
        mockCreateHuespedDto,
      );
    });

    it('debería propagar errores del servicio al crear huésped', async () => {
      // Arrange
      const errorEsperado = new Error('El huesped ya existe');
      mockHuespedesService.create.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.create(mockCreateHuespedDto)).rejects.toThrow(
        'El huesped ya existe',
      );
      expect(huespedesService.create).toHaveBeenCalledWith(
        mockCreateHuespedDto,
      );
    });
  });

  // ================================================================
  // FIND ALL - Listar huéspedes
  // ================================================================
  describe('findAll', () => {
    it('debería obtener todos los huéspedes con paginación exitosamente', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const respuestaEsperada = {
        data: [mockHuesped, { ...mockHuesped, id: 2, nombres: 'María' }],
        meta: { page: 1, limit: 10, totalHuespedes: 2, lastPage: 1 },
      };

      mockHuespedesService.findAll.mockResolvedValue(respuestaEsperada);

      // Act
      const resultado = await controller.findAll(paginationDto);

      // Assert
      expect(resultado).toEqual(respuestaEsperada);
      expect(huespedesService.findAll).toHaveBeenCalledTimes(1);
      expect(huespedesService.findAll).toHaveBeenCalledWith(paginationDto);
    });

    it('debería manejar respuesta vacía correctamente', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const respuestaVacia = {
        data: [],
        meta: { page: 1, limit: 10, totalHuespedes: 0, lastPage: 0 },
      };

      mockHuespedesService.findAll.mockResolvedValue(respuestaVacia);

      // Act
      const resultado = await controller.findAll(paginationDto);

      // Assert
      expect(resultado).toEqual(respuestaVacia);
      expect(resultado.data).toHaveLength(0);
    });
  });

  // ================================================================
  // FIND ONE - Buscar huésped por ID
  // ================================================================
  describe('findOne', () => {
    it('debería obtener un huésped por ID exitosamente', async () => {
      // Arrange
      const huespedId = 1;
      mockHuespedesService.findOne.mockResolvedValue(mockHuesped);

      // Act
      const resultado = await controller.findOne(huespedId);

      // Assert
      expect(resultado).toEqual(mockHuesped);
      expect(huespedesService.findOne).toHaveBeenCalledTimes(1);
      expect(huespedesService.findOne).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el huésped no existe', async () => {
      // Arrange
      const huespedId = 999;
      const errorEsperado = new Error('Huesped no encontrado');

      mockHuespedesService.findOne.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.findOne(huespedId)).rejects.toThrow(
        'Huesped no encontrado',
      );
      expect(huespedesService.findOne).toHaveBeenCalledWith(999);
    });
  });

  // ================================================================
  // FIND BY DOCUMENTO ID - Buscar huésped por número de documento
  // ================================================================
  describe('findByDocumentoId', () => {
    it('debería obtener un huésped por número de documento exitosamente', async () => {
      // Arrange
      const documentoId = '12345678';
      mockHuespedesService.findByDocumentoId.mockResolvedValue(mockHuesped);

      // Act
      const resultado = await controller.findByDocumentoId(documentoId);

      // Assert
      expect(resultado).toEqual(mockHuesped);
      expect(huespedesService.findByDocumentoId).toHaveBeenCalledTimes(1);
      expect(huespedesService.findByDocumentoId).toHaveBeenCalledWith(
        documentoId,
      );
    });

    it('debería propagar error cuando el huésped no existe', async () => {
      // Arrange
      const documentoId = '99999999';
      const errorEsperado = new Error('Huesped no encontrado');

      mockHuespedesService.findByDocumentoId.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.findByDocumentoId(documentoId)).rejects.toThrow(
        'Huesped no encontrado',
      );
      expect(huespedesService.findByDocumentoId).toHaveBeenCalledWith(
        documentoId,
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

      mockHuespedesService.update.mockResolvedValue(huespedActualizado);

      // Act
      const resultado = await controller.update(
        huespedId,
        mockUpdateHuespedDto,
      );

      // Assert
      expect(resultado).toEqual(huespedActualizado);
      expect(huespedesService.update).toHaveBeenCalledTimes(1);
      expect(huespedesService.update).toHaveBeenCalledWith(
        1,
        mockUpdateHuespedDto,
      );
    });

    it('debería propagar error cuando el huésped no existe para actualización', async () => {
      // Arrange
      const huespedId = 999;
      const errorEsperado = new Error('Huesped no encontrado');

      mockHuespedesService.update.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(
        controller.update(huespedId, mockUpdateHuespedDto),
      ).rejects.toThrow('Huesped no encontrado');
      expect(huespedesService.update).toHaveBeenCalledWith(
        999,
        mockUpdateHuespedDto,
      );
    });
  });

  // ================================================================
  // REMOVE - Eliminar huésped
  // ================================================================
  describe('remove', () => {
    it('debería eliminar un huésped exitosamente', async () => {
      // Arrange
      const huespedId = 1;
      const huespedEliminado = { ...mockHuesped, deleted: true };

      mockHuespedesService.remove.mockResolvedValue(huespedEliminado);

      // Act
      const resultado = await controller.remove(huespedId);

      // Assert
      expect(resultado).toEqual(huespedEliminado);
      expect(huespedesService.remove).toHaveBeenCalledTimes(1);
      expect(huespedesService.remove).toHaveBeenCalledWith(1);
    });

    it('debería propagar error cuando el huésped no existe para eliminación', async () => {
      // Arrange
      const huespedId = 999;
      const errorEsperado = new Error('Huesped no encontrado');

      mockHuespedesService.remove.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(controller.remove(huespedId)).rejects.toThrow(
        'Huesped no encontrado',
      );
      expect(huespedesService.remove).toHaveBeenCalledWith(999);
    });
  });

  // ================================================================
  // Casos de borde y validaciones
  // ================================================================
  describe('Casos de borde y validaciones', () => {
    it('debería convertir IDs de string a number correctamente', async () => {
      // Arrange
      const huespedIdString = '42';
      const huespedEsperado = { ...mockHuesped, id: 42 };

      mockHuespedesService.findOne.mockResolvedValue(huespedEsperado);

      // Act
      await controller.findOne(Number(huespedIdString));

      // Assert
      expect(huespedesService.findOne).toHaveBeenCalledWith(42);
    });

    it('debería manejar múltiples llamadas independientes', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const respuesta = { data: [], meta: {} };

      mockHuespedesService.findAll.mockResolvedValue(respuesta);

      // Act
      await controller.findAll(paginationDto);
      await controller.findAll(paginationDto);
      await controller.findAll(paginationDto);

      // Assert
      expect(huespedesService.findAll).toHaveBeenCalledTimes(3);
      expect(huespedesService.findAll).toHaveBeenNthCalledWith(
        1,
        paginationDto,
      );
      expect(huespedesService.findAll).toHaveBeenNthCalledWith(
        2,
        paginationDto,
      );
      expect(huespedesService.findAll).toHaveBeenNthCalledWith(
        3,
        paginationDto,
      );
    });

    it('debería mantener estructura de respuesta de paginación', async () => {
      // Arrange
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const respuestaPaginada = {
        data: [{ id: 1 }, { id: 2 }],
        meta: { page: 2, limit: 5, totalHuespedes: 15, lastPage: 3 },
      };

      mockHuespedesService.findAll.mockResolvedValue(respuestaPaginada);

      // Act
      const resultado = await controller.findAll(paginationDto);

      // Assert
      expect(resultado).toHaveProperty('data');
      expect(resultado).toHaveProperty('meta');
      expect(resultado.meta).toHaveProperty('page');
      expect(resultado.meta).toHaveProperty('limit');
      expect(resultado.meta).toHaveProperty('totalHuespedes');
      expect(resultado.meta).toHaveProperty('lastPage');
    });

    it('debería propagar diferentes tipos de errores del servicio', async () => {
      // Arrange
      const huespedId = 1;
      const errores = [
        new Error('Error de conexión a BD'),
        new Error('Error de validación'),
        new Error('Error interno del servidor'),
      ];

      // Act & Assert
      for (const error of errores) {
        mockHuespedesService.findOne.mockRejectedValue(error);

        await expect(controller.findOne(huespedId)).rejects.toThrow(
          error.message,
        );
      }

      expect(huespedesService.findOne).toHaveBeenCalledTimes(errores.length);
    });
  });
});
 