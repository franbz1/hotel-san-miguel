import { Test, TestingModule } from '@nestjs/testing';
import { EliminarBookingService } from './eliminar-booking.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { LinkFormularioService } from 'src/link-formulario/link-formulario.service';
import { ReservasService } from 'src/reservas/reservas.service';
import { FormulariosService } from 'src/formularios/formularios.service';
import { FacturasService } from 'src/facturas/facturas.service';
import { HuespedesService } from 'src/huespedes/huespedes.service';
import { HuespedesSecundariosService } from 'src/huespedes-secundarios/huespedes-secundarios.service';

describe('EliminarBookingService', () => {
  let service: EliminarBookingService;
  let prismaService: PrismaService;
  let linkFormularioService: LinkFormularioService;
  let reservasService: ReservasService;
  let formulariosService: FormulariosService;
  let facturasService: FacturasService;
  let huespedesService: HuespedesService;
  let huespedesSecundariosService: HuespedesSecundariosService;

  // Mock del PrismaService con transacciones
  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  // Mock del LinkFormularioService
  const mockLinkFormularioService = {
    findOne: jest.fn(),
    remove: jest.fn(),
    removeTx: jest.fn(), // Método que debe existir para transacciones
  };

  // Mock del ReservasService
  const mockReservasService = {
    findOne: jest.fn(),
    removeTx: jest.fn(), // Método que debe existir para transacciones
  };

  // Mock del FormulariosService
  const mockFormulariosService = {
    findOne: jest.fn(),
    removeTx: jest.fn(), // Método que debe existir para transacciones
  };

  // Mock del FacturasService
  const mockFacturasService = {
    removeTx: jest.fn(), // Método que debe existir para transacciones
  };

  // Mock del HuespedesService
  const mockHuespedesService = {
    removeIfNoActiveReservationsTx: jest.fn(),
  };

  // Mock del HuespedesSecundariosService
  const mockHuespedesSecundariosService = {
    removeIfNoActiveReservationsTx: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EliminarBookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LinkFormularioService,
          useValue: mockLinkFormularioService,
        },
        {
          provide: ReservasService,
          useValue: mockReservasService,
        },
        {
          provide: FormulariosService,
          useValue: mockFormulariosService,
        },
        {
          provide: FacturasService,
          useValue: mockFacturasService,
        },
        {
          provide: HuespedesService,
          useValue: mockHuespedesService,
        },
        {
          provide: HuespedesSecundariosService,
          useValue: mockHuespedesSecundariosService,
        },
      ],
    }).compile();

    service = module.get<EliminarBookingService>(EliminarBookingService);
    prismaService = module.get<PrismaService>(PrismaService);
    linkFormularioService = module.get<LinkFormularioService>(
      LinkFormularioService,
    );
    reservasService = module.get<ReservasService>(ReservasService);
    formulariosService = module.get<FormulariosService>(FormulariosService);
    facturasService = module.get<FacturasService>(FacturasService);
    huespedesService = module.get<HuespedesService>(HuespedesService);
    huespedesSecundariosService = module.get<HuespedesSecundariosService>(
      HuespedesSecundariosService,
    );
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
      expect(linkFormularioService).toBeDefined();
      expect(reservasService).toBeDefined();
      expect(formulariosService).toBeDefined();
      expect(facturasService).toBeDefined();
      expect(huespedesService).toBeDefined();
      expect(huespedesSecundariosService).toBeDefined();
    });
  });

  describe('remove - Booking no completado', () => {
    it('debería eliminar solo el link de formulario cuando no está completado', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioNoCompletado = {
        id: 1,
        token: 'token-test',
        completado: false,
        expirado: false,
        formularioId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const linkFormularioEliminado = {
        ...linkFormularioNoCompletado,
        deleted: true,
      };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioNoCompletado,
      );
      mockLinkFormularioService.remove.mockResolvedValue(
        linkFormularioEliminado,
      );

      // Act
      const resultado = await service.remove(bookingId);

      // Assert
      expect(resultado).toEqual(linkFormularioEliminado);
      expect(linkFormularioService.findOne).toHaveBeenCalledWith(bookingId);
      expect(linkFormularioService.remove).toHaveBeenCalledWith(bookingId);

      // Verificar que NO se llamaron otros servicios
      expect(formulariosService.findOne).not.toHaveBeenCalled();
      expect(reservasService.findOne).not.toHaveBeenCalled();
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('remove - Booking completado', () => {
    it('debería eliminar booking completo con factura en una transacción', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioCompletado = {
        id: 1,
        token: 'token-test',
        completado: true,
        expirado: false,
        formularioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const formulario = {
        id: 1,
        reservaId: 1,
        huespedPrincipal: 'Juan Perez',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reserva = {
        id: 1,
        facturaId: 1,
        usuarioId: 1,
        habitacionId: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reservaCompleta = {
        id: 1,
        facturaId: 1,
        huesped: {
          id: 1,
          nombre: 'Juan Perez',
          deleted: false,
        },
        huespedes_secundarios: [
          {
            id: 1,
            nombre: 'Maria Perez',
            deleted: false,
          },
          {
            id: 2,
            nombre: 'Carlos Perez',
            deleted: false,
          },
        ],
      };

      // Mock de la transacción
      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioCompletado,
      );
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      // Simular transacción exitosa
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      mockFacturasService.removeTx.mockResolvedValue({});
      mockFormulariosService.removeTx.mockResolvedValue({});
      mockReservasService.removeTx.mockResolvedValue({});
      mockLinkFormularioService.removeTx.mockResolvedValue({});

      // Mock de eliminación de huéspedes - simular que se eliminaron
      mockHuespedesSecundariosService.removeIfNoActiveReservationsTx
        .mockResolvedValueOnce({ id: 1 }) // Primer huésped secundario eliminado
        .mockResolvedValueOnce({ id: 2 }); // Segundo huésped secundario eliminado

      mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue({
        id: 1,
      }); // Huésped principal eliminado

      // Act
      const resultado = await service.remove(bookingId);

      // Assert
      expect(resultado).toEqual({
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: 1,
          huespedPrincipalEliminado: true,
          huespedesSecundariosEliminados: [1, 2],
        },
      });

      // Verificar orden de consultas
      expect(linkFormularioService.findOne).toHaveBeenCalledWith(bookingId);
      expect(formulariosService.findOne).toHaveBeenCalledWith(1);
      expect(reservasService.findOne).toHaveBeenCalledWith(1);

      // Verificar que se ejecutó la transacción
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);

      // Verificar que se obtuvo la reserva completa con huéspedes
      expect(mockTx.reserva.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deleted: false },
        include: {
          huesped: true,
          huespedes_secundarios: {
            where: { deleted: false },
          },
        },
      });

      // Verificar orden de eliminaciones en transacción
      expect(facturasService.removeTx).toHaveBeenCalledWith(1, mockTx);
      expect(formulariosService.removeTx).toHaveBeenCalledWith(1, mockTx);
      expect(reservasService.removeTx).toHaveBeenCalledWith(1, mockTx);
      expect(linkFormularioService.removeTx).toHaveBeenCalledWith(1, mockTx);

      // Verificar eliminación de huéspedes secundarios
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(2, mockTx);

      // Verificar eliminación de huésped principal
      expect(
        huespedesService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
    });

    it('debería eliminar booking completo sin factura en una transacción', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioCompletado = {
        id: 1,
        token: 'token-test',
        completado: true,
        expirado: false,
        formularioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const formulario = {
        id: 1,
        reservaId: 1,
        huespedPrincipal: 'Juan Perez',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reservaSinFactura = {
        id: 1,
        facturaId: null, // Sin factura
        usuarioId: 1,
        habitacionId: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reservaCompleta = {
        id: 1,
        facturaId: null,
        huesped: {
          id: 1,
          nombre: 'Juan Perez',
          deleted: false,
        },
        huespedes_secundarios: [
          {
            id: 1,
            nombre: 'Maria Perez',
            deleted: false,
          },
        ],
      };

      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioCompletado,
      );
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reservaSinFactura);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      mockFormulariosService.removeTx.mockResolvedValue({});
      mockReservasService.removeTx.mockResolvedValue({});
      mockLinkFormularioService.removeTx.mockResolvedValue({});

      // Mock de eliminación de huéspedes - simular que solo se eliminó el secundario
      mockHuespedesSecundariosService.removeIfNoActiveReservationsTx.mockResolvedValue(
        { id: 1 },
      );
      mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue(
        null,
      ); // Principal no se eliminó porque tiene otras reservas

      // Act
      const resultado = await service.remove(bookingId);

      // Assert
      expect(resultado).toEqual({
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: null,
          huespedPrincipalEliminado: false,
          huespedesSecundariosEliminados: [1],
        },
      });

      // Verificar que NO se intentó eliminar factura
      expect(facturasService.removeTx).not.toHaveBeenCalled();

      // Verificar orden de eliminaciones (sin factura)
      expect(formulariosService.removeTx).toHaveBeenCalledWith(1, mockTx);
      expect(reservasService.removeTx).toHaveBeenCalledWith(1, mockTx);
      expect(linkFormularioService.removeTx).toHaveBeenCalledWith(1, mockTx);

      // Verificar eliminación de huéspedes
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
      expect(
        huespedesService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
    });

    it('debería manejar booking con huéspedes que no se eliminan porque tienen otras reservas', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioCompletado = {
        id: 1,
        token: 'token-test',
        completado: true,
        expirado: false,
        formularioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const formulario = {
        id: 1,
        reservaId: 1,
        huespedPrincipal: 'Juan Perez',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reserva = {
        id: 1,
        facturaId: null,
        usuarioId: 1,
        habitacionId: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reservaCompleta = {
        id: 1,
        facturaId: null,
        huesped: {
          id: 1,
          nombre: 'Juan Perez',
          deleted: false,
        },
        huespedes_secundarios: [
          {
            id: 1,
            nombre: 'Maria Perez',
            deleted: false,
          },
          {
            id: 2,
            nombre: 'Carlos Perez',
            deleted: false,
          },
        ],
      };

      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioCompletado,
      );
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      mockFormulariosService.removeTx.mockResolvedValue({});
      mockReservasService.removeTx.mockResolvedValue({});
      mockLinkFormularioService.removeTx.mockResolvedValue({});

      // Mock de eliminación de huéspedes - ninguno se elimina porque tienen otras reservas
      mockHuespedesSecundariosService.removeIfNoActiveReservationsTx
        .mockResolvedValueOnce(null) // Primer huésped secundario no eliminado
        .mockResolvedValueOnce(null); // Segundo huésped secundario no eliminado

      mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue(
        null,
      ); // Principal no se eliminó

      // Act
      const resultado = await service.remove(bookingId);

      // Assert
      expect(resultado).toEqual({
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: null,
          huespedPrincipalEliminado: false,
          huespedesSecundariosEliminados: [],
        },
      });

      // Verificar que se intentó eliminar todos los huéspedes pero ninguno se eliminó
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledTimes(2);
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(2, mockTx);
      expect(
        huespedesService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
    });

    it('debería manejar booking sin huéspedes secundarios', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioCompletado = {
        id: 1,
        token: 'token-test',
        completado: true,
        expirado: false,
        formularioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const formulario = {
        id: 1,
        reservaId: 1,
        huespedPrincipal: 'Juan Perez',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reserva = {
        id: 1,
        facturaId: null,
        usuarioId: 1,
        habitacionId: 1,
        fechaInicio: new Date(),
        fechaFin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      };

      const reservaCompleta = {
        id: 1,
        facturaId: null,
        huesped: {
          id: 1,
          nombre: 'Juan Perez',
          deleted: false,
        },
        huespedes_secundarios: [], // Sin huéspedes secundarios
      };

      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioCompletado,
      );
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      mockFormulariosService.removeTx.mockResolvedValue({});
      mockReservasService.removeTx.mockResolvedValue({});
      mockLinkFormularioService.removeTx.mockResolvedValue({});

      // Solo el huésped principal se elimina
      mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue({
        id: 1,
      });

      // Act
      const resultado = await service.remove(bookingId);

      // Assert
      expect(resultado).toEqual({
        message: 'Booking eliminado correctamente',
        data: {
          linkFormularioId: 1,
          formularioId: 1,
          reservaId: 1,
          facturaId: null,
          huespedPrincipalEliminado: true,
          huespedesSecundariosEliminados: [],
        },
      });

      // Verificar que no se intentó eliminar huéspedes secundarios
      expect(
        huespedesSecundariosService.removeIfNoActiveReservationsTx,
      ).not.toHaveBeenCalled();
      expect(
        huespedesService.removeIfNoActiveReservationsTx,
      ).toHaveBeenCalledWith(1, mockTx);
    });
  });

  describe('Manejo de errores', () => {
    it('debería lanzar error cuando el link de formulario no existe', async () => {
      // Arrange
      const bookingIdInexistente = 999;
      const errorPrisma = { code: 'P2025' };

      mockLinkFormularioService.findOne.mockRejectedValue(errorPrisma);

      // Act & Assert
      await expect(service.remove(bookingIdInexistente)).rejects.toThrow();
      expect(linkFormularioService.findOne).toHaveBeenCalledWith(
        bookingIdInexistente,
      );
    });

    it('debería propagar errores que no sean P2025', async () => {
      // Arrange
      const bookingId = 1;
      const errorGenerico = new Error('Error de conexión');
      mockLinkFormularioService.findOne.mockRejectedValue(errorGenerico);

      // Act & Assert
      await expect(service.remove(bookingId)).rejects.toThrow(
        'Error de conexión',
      );
    });

    it('debería manejar errores en la transacción', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioCompletado = {
        id: 1,
        completado: true,
        formularioId: 1,
      };
      const formulario = { id: 1, reservaId: 1 };
      const reserva = { id: 1, facturaId: 1 };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioCompletado,
      );
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      const errorTransaccion = new Error('Error en transacción');
      mockPrismaService.$transaction.mockRejectedValue(errorTransaccion);

      // Act & Assert
      await expect(service.remove(bookingId)).rejects.toThrow(
        'Error en transacción',
      );
    });

    it('debería manejar errores en eliminación de factura dentro de transacción', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormularioCompletado = {
        id: 1,
        completado: true,
        formularioId: 1,
      };
      const formulario = { id: 1, reservaId: 1 };
      const reserva = { id: 1, facturaId: 1 };

      const reservaCompleta = {
        id: 1,
        facturaId: 1,
        huesped: { id: 1, nombre: 'Juan Perez', deleted: false },
        huespedes_secundarios: [],
      };

      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockResolvedValue(
        linkFormularioCompletado,
      );
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      const errorEliminacionFactura = new Error('Error eliminando factura');
      mockFacturasService.removeTx.mockRejectedValue(errorEliminacionFactura);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      // Act & Assert
      await expect(service.remove(bookingId)).rejects.toThrow(
        'Error eliminando factura',
      );
    });
  });

  describe('Validaciones de orden de ejecución', () => {
    it('debería ejecutar las consultas en el orden correcto para booking completado', async () => {
      // Arrange
      const bookingId = 1;
      const operaciones: string[] = [];

      const linkFormulario = { id: 1, completado: true, formularioId: 1 };
      const formulario = { id: 1, reservaId: 1 };
      const reserva = { id: 1, facturaId: null };

      const reservaCompleta = {
        id: 1,
        facturaId: null,
        huesped: { id: 1, nombre: 'Juan Perez', deleted: false },
        huespedes_secundarios: [],
      };

      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockImplementation(async () => {
        operaciones.push('findOne-linkFormulario');
        return linkFormulario;
      });

      mockFormulariosService.findOne.mockImplementation(async () => {
        operaciones.push('findOne-formulario');
        return formulario;
      });

      mockReservasService.findOne.mockImplementation(async () => {
        operaciones.push('findOne-reserva');
        return reserva;
      });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        operaciones.push('inicio-transaccion');
        const result = await callback(mockTx);
        operaciones.push('fin-transaccion');
        return result;
      });

      mockFormulariosService.removeTx.mockImplementation(async () => {
        operaciones.push('removeTx-formulario');
        return {};
      });

      mockReservasService.removeTx.mockImplementation(async () => {
        operaciones.push('removeTx-reserva');
        return {};
      });

      mockLinkFormularioService.removeTx.mockImplementation(async () => {
        operaciones.push('removeTx-linkFormulario');
        return {};
      });

      mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue(
        null,
      );

      // Act
      await service.remove(bookingId);

      // Assert
      expect(operaciones).toEqual([
        'findOne-linkFormulario',
        'findOne-formulario',
        'findOne-reserva',
        'inicio-transaccion',
        'removeTx-formulario',
        'removeTx-reserva',
        'removeTx-linkFormulario',
        'fin-transaccion',
      ]);
    });

    it('debería ejecutar eliminaciones en orden correcto: factura -> formulario -> reserva -> link', async () => {
      // Arrange
      const bookingId = 1;
      const operacionesEliminacion: string[] = [];

      const linkFormulario = { id: 1, completado: true, formularioId: 1 };
      const formulario = { id: 1, reservaId: 1 };
      const reserva = { id: 1, facturaId: 1 };

      const reservaCompleta = {
        id: 1,
        facturaId: 1,
        huesped: { id: 1, nombre: 'Juan Perez', deleted: false },
        huespedes_secundarios: [],
      };

      const mockTx = {
        reserva: {
          findFirst: jest.fn().mockResolvedValue(reservaCompleta),
        },
      };

      mockLinkFormularioService.findOne.mockResolvedValue(linkFormulario);
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      mockFacturasService.removeTx.mockImplementation(async () => {
        operacionesEliminacion.push('factura');
        return {};
      });

      mockFormulariosService.removeTx.mockImplementation(async () => {
        operacionesEliminacion.push('formulario');
        return {};
      });

      mockReservasService.removeTx.mockImplementation(async () => {
        operacionesEliminacion.push('reserva');
        return {};
      });

      mockLinkFormularioService.removeTx.mockImplementation(async () => {
        operacionesEliminacion.push('linkFormulario');
        return {};
      });

      mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue(
        null,
      );

      // Act
      await service.remove(bookingId);

      // Assert
      expect(operacionesEliminacion).toEqual([
        'factura',
        'formulario',
        'reserva',
        'linkFormulario',
      ]);
    });
  });

  describe('Casos de borde y validaciones adicionales', () => {
    it('debería manejar booking con diferentes IDs correctamente', async () => {
      // Arrange
      const testCases = [
        { bookingId: 1, formularioId: 10, reservaId: 100, facturaId: 1000 },
        { bookingId: 999, formularioId: 888, reservaId: 777, facturaId: null },
      ];

      for (const testCase of testCases) {
        const linkFormulario = {
          id: testCase.bookingId,
          completado: true,
          formularioId: testCase.formularioId,
        };
        const formulario = {
          id: testCase.formularioId,
          reservaId: testCase.reservaId,
        };
        const reserva = {
          id: testCase.reservaId,
          facturaId: testCase.facturaId,
        };

        const reservaCompleta = {
          id: testCase.reservaId,
          facturaId: testCase.facturaId,
          huesped: { id: 1, nombre: 'Juan Perez', deleted: false },
          huespedes_secundarios: [],
        };

        const mockTx = {
          reserva: {
            findFirst: jest.fn().mockResolvedValue(reservaCompleta),
          },
        };

        mockLinkFormularioService.findOne.mockResolvedValue(linkFormulario);
        mockFormulariosService.findOne.mockResolvedValue(formulario);
        mockReservasService.findOne.mockResolvedValue(reserva);

        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback(mockTx);
        });

        mockHuespedesService.removeIfNoActiveReservationsTx.mockResolvedValue(
          null,
        );

        // Act
        const resultado = await service.remove(testCase.bookingId);

        // Assert
        expect((resultado as any).data).toEqual({
          linkFormularioId: testCase.bookingId,
          formularioId: testCase.formularioId,
          reservaId: testCase.reservaId,
          facturaId: testCase.facturaId,
          huespedPrincipalEliminado: false,
          huespedesSecundariosEliminados: [],
        });
      }
    });

    it('debería garantizar que todas las operaciones se ejecuten en la misma transacción', async () => {
      // Arrange
      const bookingId = 1;
      const linkFormulario = { id: 1, completado: true, formularioId: 1 };
      const formulario = { id: 1, reservaId: 1 };
      const reserva = { id: 1, facturaId: 1 };

      const reservaCompleta = {
        id: 1,
        facturaId: 1,
        huesped: { id: 1, nombre: 'Juan Perez', deleted: false },
        huespedes_secundarios: [],
      };

      let transaccionActual: any = null;

      mockLinkFormularioService.findOne.mockResolvedValue(linkFormulario);
      mockFormulariosService.findOne.mockResolvedValue(formulario);
      mockReservasService.findOne.mockResolvedValue(reserva);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          id: 'unique-transaction-id',
          reserva: {
            findFirst: jest.fn().mockResolvedValue(reservaCompleta),
          },
        };
        transaccionActual = tx;
        return await callback(tx);
      });

      // Verificar que todos los métodos reciban la misma instancia de transacción
      mockFacturasService.removeTx.mockImplementation(async (id, tx) => {
        expect(tx).toBe(transaccionActual);
        return {};
      });

      mockFormulariosService.removeTx.mockImplementation(async (id, tx) => {
        expect(tx).toBe(transaccionActual);
        return {};
      });

      mockReservasService.removeTx.mockImplementation(async (id, tx) => {
        expect(tx).toBe(transaccionActual);
        return {};
      });

      mockLinkFormularioService.removeTx.mockImplementation(async (id, tx) => {
        expect(tx).toBe(transaccionActual);
        return {};
      });

      mockHuespedesService.removeIfNoActiveReservationsTx.mockImplementation(
        async (id, tx) => {
          expect(tx).toBe(transaccionActual);
          return null;
        },
      );

      // Act
      await service.remove(bookingId);

      // Assert
      expect(transaccionActual).not.toBeNull();
    });
  });
});
