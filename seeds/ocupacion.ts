// prisma/seed.ts (o .js)
import { PrismaClient } from '@prisma/client';
import { EstadoHabitacion } from '../src/common/enums/estadosHbaitacion.enum';
import { EstadosReserva } from '../src/common/enums/estadosReserva.enum';
import { MotivosViajes } from '../src/common/enums/motivosViajes.enum';

const prisma = new PrismaClient();

async function main() {
  // 1) Crear usuarios con diferentes roles
  await prisma.usuario.createMany({
    data: [
      {
        id: 5,
        nombre: 'Admin Principal',
        rol: 'ADMINISTRADOR',
        password: '$2b$10$hashedPasswordAdmin123', // En producción usa bcrypt
        deleted: false,
      },
      {
        id: 2,
        nombre: 'María García',
        rol: 'CAJERO',
        password: '$2b$10$hashedPasswordCajero123',
        deleted: false,
      },
      {
        id: 3,
        nombre: 'Carlos Rodríguez',
        rol: 'ASEO',
        password: '$2b$10$hashedPasswordAseo123',
        deleted: false,
      },
      {
        id: 4,
        nombre: 'Ana López',
        rol: 'REGISTRO_FORMULARIO',
        password: '$2b$10$hashedPasswordRegistro123',
        deleted: false,
      },
    ],
  });

  // 2) Crear huéspedes principales
  await prisma.huesped.createMany({
    data: [
      {
        id: 1,
        tipo_documento: 'CC',
        numero_documento: '12345678',
        primer_apellido: 'González',
        segundo_apellido: 'Martínez',
        nombres: 'Juan Carlos',
        pais_residencia: 'Colombia',
        ciudad_residencia: 'Bogotá',
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Medellín',
        lugar_nacimiento: 'Bogotá, Colombia',
        fecha_nacimiento: new Date('1985-03-15'),
        nacionalidad: 'Colombiana',
        ocupacion: 'Ingeniero',
        genero: 'MASCULINO',
        telefono: '+57 300 123 4567',
        correo: 'juan.gonzalez@email.com',
        deleted: false,
      },
      {
        id: 2,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'AB123456',
        primer_apellido: 'Smith',
        segundo_apellido: null,
        nombres: 'Jennifer',
        pais_residencia: 'Estados Unidos',
        ciudad_residencia: 'Miami',
        pais_procedencia: 'Estados Unidos',
        ciudad_procedencia: 'New York',
        lugar_nacimiento: 'New York, USA',
        fecha_nacimiento: new Date('1990-07-22'),
        nacionalidad: 'Estadounidense',
        ocupacion: 'Diseñadora',
        genero: 'FEMENINO',
        telefono: '+1 305 987 6543',
        correo: 'jennifer.smith@email.com',
        deleted: false,
      },
      {
        id: 3,
        tipo_documento: 'DNI',
        numero_documento: '87654321',
        primer_apellido: 'Rodríguez',
        segundo_apellido: 'Pérez',
        nombres: 'María Elena',
        pais_residencia: 'Argentina',
        ciudad_residencia: 'Buenos Aires',
        pais_procedencia: 'Argentina',
        ciudad_procedencia: 'Córdoba',
        lugar_nacimiento: 'Buenos Aires, Argentina',
        fecha_nacimiento: new Date('1978-11-08'),
        nacionalidad: 'Argentina',
        ocupacion: 'Doctora',
        genero: 'FEMENINO',
        telefono: '+54 11 2345 6789',
        correo: 'maria.rodriguez@email.com',
        deleted: false,
      },
      {
        id: 4,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'BR789123',
        primer_apellido: 'Silva',
        segundo_apellido: 'Santos',
        nombres: 'Carlos Eduardo',
        pais_residencia: 'Brasil',
        ciudad_residencia: 'São Paulo',
        pais_procedencia: 'Brasil',
        ciudad_procedencia: 'Rio de Janeiro',
        lugar_nacimiento: 'São Paulo, Brasil',
        fecha_nacimiento: new Date('1982-09-12'),
        nacionalidad: 'Brasileña',
        ocupacion: 'Abogado',
        genero: 'MASCULINO',
        telefono: '+55 11 9876 5432',
        correo: 'carlos.silva@email.com',
        deleted: false,
      },
      {
        id: 5,
        tipo_documento: 'CE',
        numero_documento: 'VE456789',
        primer_apellido: 'Morales',
        segundo_apellido: 'Díaz',
        nombres: 'Gabriela',
        pais_residencia: 'Venezuela',
        ciudad_residencia: 'Caracas',
        pais_procedencia: 'Venezuela',
        ciudad_procedencia: 'Valencia',
        lugar_nacimiento: 'Caracas, Venezuela',
        fecha_nacimiento: new Date('1993-12-05'),
        nacionalidad: 'Venezolana',
        ocupacion: 'Periodista',
        genero: 'FEMENINO',
        telefono: '+58 212 345 6789',
        correo: 'gabriela.morales@email.com',
        deleted: false,
      },
      {
        id: 6,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'FR234567',
        primer_apellido: 'Dubois',
        segundo_apellido: null,
        nombres: 'Pierre',
        pais_residencia: 'Francia',
        ciudad_residencia: 'París',
        pais_procedencia: 'Francia',
        ciudad_procedencia: 'Lyon',
        lugar_nacimiento: 'París, Francia',
        fecha_nacimiento: new Date('1975-04-18'),
        nacionalidad: 'Francesa',
        ocupacion: 'Chef',
        genero: 'MASCULINO',
        telefono: '+33 1 23 45 67 89',
        correo: 'pierre.dubois@email.com',
        deleted: false,
      },
      {
        id: 7,
        tipo_documento: 'CC',
        numero_documento: '98765432',
        primer_apellido: 'Herrera',
        segundo_apellido: 'Castro',
        nombres: 'Luis Fernando',
        pais_residencia: 'Colombia',
        ciudad_residencia: 'Cali',
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Barranquilla',
        lugar_nacimiento: 'Cali, Colombia',
        fecha_nacimiento: new Date('1988-01-25'),
        nacionalidad: 'Colombiana',
        ocupacion: 'Contador',
        genero: 'MASCULINO',
        telefono: '+57 315 987 6543',
        correo: 'luis.herrera@email.com',
        deleted: false,
      },
      {
        id: 8,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'IT345678',
        primer_apellido: 'Rossi',
        segundo_apellido: null,
        nombres: 'Sofia',
        pais_residencia: 'Italia',
        ciudad_residencia: 'Roma',
        pais_procedencia: 'Italia',
        ciudad_procedencia: 'Milán',
        lugar_nacimiento: 'Roma, Italia',
        fecha_nacimiento: new Date('1991-06-30'),
        nacionalidad: 'Italiana',
        ocupacion: 'Artista',
        genero: 'FEMENINO',
        telefono: '+39 06 1234 5678',
        correo: 'sofia.rossi@email.com',
        deleted: false,
      },
      {
        id: 9,
        tipo_documento: 'DNI',
        numero_documento: '45678912',
        primer_apellido: 'Torres',
        segundo_apellido: 'Mendoza',
        nombres: 'Roberto Carlos',
        pais_residencia: 'Argentina',
        ciudad_residencia: 'Mendoza',
        pais_procedencia: 'Argentina',
        ciudad_procedencia: 'Rosario',
        lugar_nacimiento: 'Mendoza, Argentina',
        fecha_nacimiento: new Date('1979-10-14'),
        nacionalidad: 'Argentina',
        ocupacion: 'Sommelier',
        genero: 'MASCULINO',
        telefono: '+54 261 456 7890',
        correo: 'roberto.torres@email.com',
        deleted: false,
      },
      {
        id: 10,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'JP567890',
        primer_apellido: 'Yamamoto',
        segundo_apellido: null,
        nombres: 'Akiko',
        pais_residencia: 'Japón',
        ciudad_residencia: 'Tokio',
        pais_procedencia: 'Japón',
        ciudad_procedencia: 'Osaka',
        lugar_nacimiento: 'Tokio, Japón',
        fecha_nacimiento: new Date('1986-08-22'),
        nacionalidad: 'Japonesa',
        ocupacion: 'Traductora',
        genero: 'FEMENINO',
        telefono: '+81 3 1234 5678',
        correo: 'akiko.yamamoto@email.com',
        deleted: false,
      },
    ],
  });

  // 3) Crear huéspedes secundarios (acompañantes)
  await prisma.huespedSecundario.createMany({
    data: [
      {
        id: 1,
        tipo_documento: 'CC',
        numero_documento: '87654321',
        primer_apellido: 'González',
        segundo_apellido: 'Hernández',
        nombres: 'Ana María',
        pais_residencia: 'Colombia',
        ciudad_residencia: 'Bogotá',
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Medellín',
        fecha_nacimiento: new Date('1987-05-20'),
        nacionalidad: 'Colombiana',
        ocupacion: 'Arquitecta',
        genero: 'FEMENINO',
        telefono: '+57 301 234 5678',
        correo: 'ana.gonzalez@email.com',
        huespedId: 1, // Asociada al huésped principal Juan Carlos
        deleted: false,
      },
      {
        id: 2,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'CD789012',
        primer_apellido: 'Smith',
        segundo_apellido: null,
        nombres: 'Michael',
        pais_residencia: 'Estados Unidos',
        ciudad_residencia: 'Miami',
        pais_procedencia: 'Estados Unidos',
        ciudad_procedencia: 'New York',
        fecha_nacimiento: new Date('1988-12-10'),
        nacionalidad: 'Estadounidense',
        ocupacion: 'Fotógrafo',
        genero: 'MASCULINO',
        telefono: '+1 305 876 5432',
        correo: 'michael.smith@email.com',
        huespedId: 2, // Asociado a Jennifer Smith
        deleted: false,
      },
      {
        id: 3,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'BR456789',
        primer_apellido: 'Silva',
        segundo_apellido: 'Costa',
        nombres: 'Fernanda',
        pais_residencia: 'Brasil',
        ciudad_residencia: 'São Paulo',
        pais_procedencia: 'Brasil',
        ciudad_procedencia: 'Rio de Janeiro',
        fecha_nacimiento: new Date('1984-07-15'),
        nacionalidad: 'Brasileña',
        ocupacion: 'Psicóloga',
        genero: 'FEMENINO',
        telefono: '+55 11 8765 4321',
        correo: 'fernanda.silva@email.com',
        huespedId: 4, // Asociada a Carlos Eduardo Silva
        deleted: false,
      },
      {
        id: 4,
        tipo_documento: 'TI',
        numero_documento: 'BR987654',
        primer_apellido: 'Silva',
        segundo_apellido: 'Costa',
        nombres: 'Pedro',
        pais_residencia: 'Brasil',
        ciudad_residencia: 'São Paulo',
        pais_procedencia: 'Brasil',
        ciudad_procedencia: 'Rio de Janeiro',
        fecha_nacimiento: new Date('2010-03-20'),
        nacionalidad: 'Brasileña',
        ocupacion: 'Estudiante',
        genero: 'MASCULINO',
        telefono: '+55 11 8765 4322',
        correo: null,
        huespedId: 4, // Hijo de Carlos Eduardo Silva
        deleted: false,
      },
      {
        id: 5,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'FR987654',
        primer_apellido: 'Dubois',
        segundo_apellido: null,
        nombres: 'Marie',
        pais_residencia: 'Francia',
        ciudad_residencia: 'París',
        pais_procedencia: 'Francia',
        ciudad_procedencia: 'Lyon',
        fecha_nacimiento: new Date('1977-11-12'),
        nacionalidad: 'Francesa',
        ocupacion: 'Sommelier',
        genero: 'FEMENINO',
        telefono: '+33 1 98 76 54 32',
        correo: 'marie.dubois@email.com',
        huespedId: 6, // Asociada a Pierre Dubois
        deleted: false,
      },
      {
        id: 6,
        tipo_documento: 'CC',
        numero_documento: '11223344',
        primer_apellido: 'Herrera',
        segundo_apellido: 'Vega',
        nombres: 'Carmen Elena',
        pais_residencia: 'Colombia',
        ciudad_residencia: 'Cali',
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Barranquilla',
        fecha_nacimiento: new Date('1990-09-08'),
        nacionalidad: 'Colombiana',
        ocupacion: 'Enfermera',
        genero: 'FEMENINO',
        telefono: '+57 316 123 4567',
        correo: 'carmen.herrera@email.com',
        huespedId: 7, // Asociada a Luis Fernando Herrera
        deleted: false,
      },
      {
        id: 7,
        tipo_documento: 'TI',
        numero_documento: '55667788',
        primer_apellido: 'Herrera',
        segundo_apellido: 'Vega',
        nombres: 'Santiago',
        pais_residencia: 'Colombia',
        ciudad_residencia: 'Cali',
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Barranquilla',
        fecha_nacimiento: new Date('2012-05-15'),
        nacionalidad: 'Colombiana',
        ocupacion: 'Estudiante',
        genero: 'MASCULINO',
        telefono: null,
        correo: null,
        huespedId: 7, // Hijo de Luis Fernando Herrera
        deleted: false,
      },
      {
        id: 8,
        tipo_documento: 'PASAPORTE',
        numero_documento: 'IT789012',
        primer_apellido: 'Bianchi',
        segundo_apellido: null,
        nombres: 'Marco',
        pais_residencia: 'Italia',
        ciudad_residencia: 'Roma',
        pais_procedencia: 'Italia',
        ciudad_procedencia: 'Milán',
        fecha_nacimiento: new Date('1989-02-28'),
        nacionalidad: 'Italiana',
        ocupacion: 'Músico',
        genero: 'MASCULINO',
        telefono: '+39 06 9876 5432',
        correo: 'marco.bianchi@email.com',
        huespedId: 8, // Asociado a Sofia Rossi
        deleted: false,
      },
    ],
  });

  // 4) Crear habitaciones
  await prisma.habitacion.createMany({
    data: [
      {
        id: 1,
        numero_habitacion: 101,
        tipo: 'SENCILLA',
        precio_por_noche: 100.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 2,
        numero_habitacion: 102,
        tipo: 'DOBLE',
        precio_por_noche: 150.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 3,
        numero_habitacion: 103,
        tipo: 'SUITE',
        precio_por_noche: 300.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 4,
        numero_habitacion: 104,
        tipo: 'DOBLE',
        precio_por_noche: 180.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 5,
        numero_habitacion: 105,
        tipo: 'SUITE',
        precio_por_noche: 350.0,
        deleted: false,
        estado: EstadoHabitacion.EN_MANTENIMIENTO,
      },
      {
        id: 6,
        numero_habitacion: 201,
        tipo: 'SENCILLA',
        precio_por_noche: 120.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 7,
        numero_habitacion: 202,
        tipo: 'DOBLE',
        precio_por_noche: 170.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 8,
        numero_habitacion: 203,
        tipo: 'SUITE',
        precio_por_noche: 320.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 9,
        numero_habitacion: 301,
        tipo: 'SENCILLA',
        precio_por_noche: 110.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
      {
        id: 10,
        numero_habitacion: 302,
        tipo: 'DOBLE',
        precio_por_noche: 160.0,
        deleted: false,
        estado: EstadoHabitacion.OCUPADO,
      },
      {
        id: 11,
        numero_habitacion: 303,
        tipo: 'SUITE',
        precio_por_noche: 380.0,
        deleted: false,
        estado: EstadoHabitacion.RESERVADO,
      },
      {
        id: 12,
        numero_habitacion: 304,
        tipo: 'APARTAMENTO',
        precio_por_noche: 500.0,
        deleted: false,
        estado: EstadoHabitacion.LIBRE,
      },
    ],
  });

  // 5) Crear reservas
  await prisma.reserva.createMany({
    data: [
      {
        id: 1,
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-01-04'),
        costo: 300.0,
        habitacionId: 1,
        huespedId: 1,
        deleted: false,
        estado: EstadosReserva.FINALIZADO,
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Medellín',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
        check_in: new Date('2025-01-01T14:00:00'),
        check_out: new Date('2025-01-04T11:00:00'),
        numero_acompaniantes: 1,
      },
      {
        id: 2,
        fecha_inicio: new Date('2025-01-15'),
        fecha_fin: new Date('2025-01-17'),
        costo: 300.0,
        habitacionId: 2,
        huespedId: 2,
        deleted: false,
        estado: EstadosReserva.FINALIZADO,
        pais_procedencia: 'Estados Unidos',
        ciudad_procedencia: 'New York',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
        check_in: new Date('2025-01-15T15:00:00'),
        check_out: new Date('2025-01-17T10:00:00'),
        numero_acompaniantes: 1,
      },
      {
        id: 3,
        fecha_inicio: new Date('2025-01-28'),
        fecha_fin: new Date('2025-02-02'),
        costo: 500.0,
        habitacionId: 1,
        huespedId: 1,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Medellín',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
        check_in: new Date('2025-01-28T14:00:00'),
        check_out: new Date('2025-02-02T11:00:00'),
        numero_acompaniantes: 1,
      },
      {
        id: 4,
        fecha_inicio: new Date('2025-02-05'),
        fecha_fin: new Date('2025-02-08'),
        costo: 900.0,
        habitacionId: 3,
        huespedId: 3,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Argentina',
        ciudad_procedencia: 'Córdoba',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.SALUD_Y_ATENCION_MEDICA,
        check_in: new Date('2025-02-05T14:00:00'),
        check_out: new Date('2025-02-08T11:00:00'),
        numero_acompaniantes: 0,
      },
      {
        id: 5,
        fecha_inicio: new Date('2025-02-10'),
        fecha_fin: new Date('2025-02-12'),
        costo: 300.0,
        habitacionId: 2,
        huespedId: 2,
        deleted: false,
        estado: EstadosReserva.PENDIENTE,
        pais_procedencia: 'Estados Unidos',
        ciudad_procedencia: 'Miami',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.COMPRAS,
        check_in: new Date('2025-02-10T15:00:00'),
        check_out: new Date('2025-02-12T10:00:00'),
        numero_acompaniantes: 1,
      },
      // Reservas del flujo: LinkFormulario → Formulario → Huésped → Reserva
      {
        id: 6,
        fecha_inicio: new Date('2025-02-15'),
        fecha_fin: new Date('2025-02-18'),
        costo: 1200.0,
        habitacionId: 8,
        huespedId: 4,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Brasil',
        ciudad_procedencia: 'Rio de Janeiro',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
        check_in: new Date('2025-02-15T14:00:00'),
        check_out: new Date('2025-02-18T11:00:00'),
        numero_acompaniantes: 2, // Fernanda y Pedro
      },
      {
        id: 7,
        fecha_inicio: new Date('2025-02-20'),
        fecha_fin: new Date('2025-02-22'),
        costo: 240.0,
        habitacionId: 6,
        huespedId: 5,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Venezuela',
        ciudad_procedencia: 'Valencia',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
        check_in: new Date('2025-02-20T15:00:00'),
        check_out: new Date('2025-02-22T10:00:00'),
        numero_acompaniantes: 0,
      },
      {
        id: 8,
        fecha_inicio: new Date('2025-03-01'),
        fecha_fin: new Date('2025-03-05'),
        costo: 1280.0,
        habitacionId: 8,
        huespedId: 6,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Francia',
        ciudad_procedencia: 'Lyon',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.OTROS_MOTIVOS,
        check_in: new Date('2025-03-01T14:00:00'),
        check_out: new Date('2025-03-05T11:00:00'),
        numero_acompaniantes: 1, // Marie
      },
      {
        id: 9,
        fecha_inicio: new Date('2025-03-10'),
        fecha_fin: new Date('2025-03-13'),
        costo: 510.0,
        habitacionId: 7,
        huespedId: 7,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Barranquilla',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.VISITAS_A_FAMILIARES_Y_AMIGOS,
        check_in: new Date('2025-03-10T14:00:00'),
        check_out: new Date('2025-03-13T11:00:00'),
        numero_acompaniantes: 2, // Carmen Elena y Santiago
      },
      {
        id: 10,
        fecha_inicio: new Date('2025-03-15'),
        fecha_fin: new Date('2025-03-17'),
        costo: 640.0,
        habitacionId: 8,
        huespedId: 8,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Italia',
        ciudad_procedencia: 'Milán',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.EDUCACION_Y_FORMACION,
        check_in: new Date('2025-03-15T15:00:00'),
        check_out: new Date('2025-03-17T10:00:00'),
        numero_acompaniantes: 1, // Marco
      },
      {
        id: 11,
        fecha_inicio: new Date('2025-03-20'),
        fecha_fin: new Date('2025-03-23'),
        costo: 1140.0,
        habitacionId: 11,
        huespedId: 9,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Argentina',
        ciudad_procedencia: 'Rosario',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.OTROS_MOTIVOS,
        check_in: new Date('2025-03-20T14:00:00'),
        check_out: new Date('2025-03-23T11:00:00'),
        numero_acompaniantes: 0,
      },
      {
        id: 12,
        fecha_inicio: new Date('2025-03-25'),
        fecha_fin: new Date('2025-03-28'),
        costo: 330.0,
        habitacionId: 9,
        huespedId: 10,
        deleted: false,
        estado: EstadosReserva.RESERVADO,
        pais_procedencia: 'Japón',
        ciudad_procedencia: 'Osaka',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.EDUCACION_Y_FORMACION,
        check_in: new Date('2025-03-25T15:00:00'),
        check_out: new Date('2025-03-28T10:00:00'),
        numero_acompaniantes: 0,
      },
      // Reservas pasadas finalizadas
      {
        id: 13,
        fecha_inicio: new Date('2024-12-15'),
        fecha_fin: new Date('2024-12-18'),
        costo: 900.0,
        habitacionId: 3,
        huespedId: 4,
        deleted: false,
        estado: EstadosReserva.FINALIZADO,
        pais_procedencia: 'Brasil',
        ciudad_procedencia: 'Rio de Janeiro',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
        check_in: new Date('2024-12-15T14:00:00'),
        check_out: new Date('2024-12-18T11:00:00'),
        numero_acompaniantes: 1, // Solo Fernanda
      },
      {
        id: 14,
        fecha_inicio: new Date('2024-11-20'),
        fecha_fin: new Date('2024-11-22'),
        costo: 460.0,
        habitacionId: 1,
        huespedId: 7,
        deleted: false,
        estado: EstadosReserva.FINALIZADO,
        pais_procedencia: 'Colombia',
        ciudad_procedencia: 'Barranquilla',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.NEGOCIOS_Y_MOTIVOS_PROFESIONALES,
        check_in: new Date('2024-11-20T14:00:00'),
        check_out: new Date('2024-11-22T11:00:00'),
        numero_acompaniantes: 0,
      },
      {
        id: 15,
        fecha_inicio: new Date('2024-10-10'),
        fecha_fin: new Date('2024-10-14'),
        costo: 1000.0,
        habitacionId: 12,
        huespedId: 6,
        deleted: false,
        estado: EstadosReserva.FINALIZADO,
        pais_procedencia: 'Francia',
        ciudad_procedencia: 'Lyon',
        pais_destino: 'Colombia',
        motivo_viaje: MotivosViajes.VACACIONES_RECREO_Y_OCIO,
        check_in: new Date('2024-10-10T15:00:00'),
        check_out: new Date('2024-10-14T10:00:00'),
        numero_acompaniantes: 1, // Marie
      },
    ],
  });

  // 6) Crear documentos subidos
  await prisma.documento.createMany({
    data: [
      // Documentos huéspedes principales
      {
        id: 1,
        url: '/uploads/documentos/cedula_juan_gonzalez.pdf',
        nombre: 'Cédula de Ciudadanía - Juan González',
        huespedId: 1,
      },
      {
        id: 2,
        url: '/uploads/documentos/pasaporte_jennifer_smith.pdf',
        nombre: 'Pasaporte - Jennifer Smith',
        huespedId: 2,
      },
      {
        id: 3,
        url: '/uploads/documentos/dni_maria_rodriguez.pdf',
        nombre: 'DNI - María Rodríguez',
        huespedId: 3,
      },
      {
        id: 4,
        url: '/uploads/documentos/pasaporte_carlos_silva.pdf',
        nombre: 'Pasaporte - Carlos Eduardo Silva',
        huespedId: 4,
      },
      {
        id: 5,
        url: '/uploads/documentos/ce_gabriela_morales.pdf',
        nombre: 'Cédula de Extranjería - Gabriela Morales',
        huespedId: 5,
      },
      {
        id: 6,
        url: '/uploads/documentos/pasaporte_pierre_dubois.pdf',
        nombre: 'Pasaporte - Pierre Dubois',
        huespedId: 6,
      },
      {
        id: 7,
        url: '/uploads/documentos/cedula_luis_herrera.pdf',
        nombre: 'Cédula de Ciudadanía - Luis Fernando Herrera',
        huespedId: 7,
      },
      {
        id: 8,
        url: '/uploads/documentos/pasaporte_sofia_rossi.pdf',
        nombre: 'Pasaporte - Sofia Rossi',
        huespedId: 8,
      },
      {
        id: 9,
        url: '/uploads/documentos/dni_roberto_torres.pdf',
        nombre: 'DNI - Roberto Carlos Torres',
        huespedId: 9,
      },
      {
        id: 10,
        url: '/uploads/documentos/pasaporte_akiko_yamamoto.pdf',
        nombre: 'Pasaporte - Akiko Yamamoto',
        huespedId: 10,
      },
      // Documentos huéspedes secundarios
      {
        id: 11,
        url: '/uploads/documentos/cedula_ana_gonzalez.pdf',
        nombre: 'Cédula de Ciudadanía - Ana González',
        huespedSecundarioId: 1,
      },
      {
        id: 12,
        url: '/uploads/documentos/pasaporte_michael_smith.pdf',
        nombre: 'Pasaporte - Michael Smith',
        huespedSecundarioId: 2,
      },
      {
        id: 13,
        url: '/uploads/documentos/pasaporte_fernanda_silva.pdf',
        nombre: 'Pasaporte - Fernanda Silva',
        huespedSecundarioId: 3,
      },
      {
        id: 14,
        url: '/uploads/documentos/ti_pedro_silva.pdf',
        nombre: 'Tarjeta de Identidad - Pedro Silva',
        huespedSecundarioId: 4,
      },
      {
        id: 15,
        url: '/uploads/documentos/pasaporte_marie_dubois.pdf',
        nombre: 'Pasaporte - Marie Dubois',
        huespedSecundarioId: 5,
      },
      {
        id: 16,
        url: '/uploads/documentos/cedula_carmen_herrera.pdf',
        nombre: 'Cédula de Ciudadanía - Carmen Elena Herrera',
        huespedSecundarioId: 6,
      },
      {
        id: 17,
        url: '/uploads/documentos/ti_santiago_herrera.pdf',
        nombre: 'Tarjeta de Identidad - Santiago Herrera',
        huespedSecundarioId: 7,
      },
      {
        id: 18,
        url: '/uploads/documentos/pasaporte_marco_bianchi.pdf',
        nombre: 'Pasaporte - Marco Bianchi',
        huespedSecundarioId: 8,
      },
    ],
  });

  // 7) Crear facturas
  await prisma.factura.createMany({
    data: [
      {
        id: 1,
        total: 300.0,
        fecha_factura: new Date('2025-01-04'),
        huespedId: 1,
        deleted: false,
      },
      {
        id: 2,
        total: 300.0,
        fecha_factura: new Date('2025-01-17'),
        huespedId: 2,
        deleted: false,
      },
      {
        id: 3,
        total: 900.0,
        fecha_factura: new Date('2025-02-08'),
        huespedId: 3,
        deleted: false,
      },
      // Facturas para reservas finalizadas
      {
        id: 4,
        total: 900.0,
        fecha_factura: new Date('2024-12-18'),
        huespedId: 4,
        deleted: false,
      },
      {
        id: 5,
        total: 200.0,
        fecha_factura: new Date('2024-11-22'),
        huespedId: 7,
        deleted: false,
      },
      {
        id: 6,
        total: 2000.0,
        fecha_factura: new Date('2024-10-14'),
        huespedId: 6,
        deleted: false,
      },
      // Facturas para futuras reservas (cuando se completen)
      {
        id: 7,
        total: 1200.0,
        fecha_factura: new Date('2025-02-18'),
        huespedId: 4,
        deleted: false,
      },
      {
        id: 8,
        total: 240.0,
        fecha_factura: new Date('2025-02-22'),
        huespedId: 5,
        deleted: false,
      },
      {
        id: 9,
        total: 1280.0,
        fecha_factura: new Date('2025-03-05'),
        huespedId: 6,
        deleted: false,
      },
      {
        id: 10,
        total: 510.0,
        fecha_factura: new Date('2025-03-13'),
        huespedId: 7,
        deleted: false,
      },
      {
        id: 11,
        total: 640.0,
        fecha_factura: new Date('2025-03-17'),
        huespedId: 8,
        deleted: false,
      },
      {
        id: 12,
        total: 1140.0,
        fecha_factura: new Date('2025-03-23'),
        huespedId: 9,
        deleted: false,
      },
      {
        id: 13,
        total: 330.0,
        fecha_factura: new Date('2025-03-28'),
        huespedId: 10,
        deleted: false,
      },
    ],
  });

  // 8) Actualizar reservas con facturas
  await prisma.reserva.update({
    where: { id: 1 },
    data: { facturaId: 1 },
  });

  await prisma.reserva.update({
    where: { id: 2 },
    data: { facturaId: 2 },
  });

  await prisma.reserva.update({
    where: { id: 4 },
    data: { facturaId: 3 },
  });

  // Actualizar reservas finalizadas con sus facturas
  await prisma.reserva.update({
    where: { id: 13 },
    data: { facturaId: 4 },
  });

  await prisma.reserva.update({
    where: { id: 14 },
    data: { facturaId: 5 },
  });

  await prisma.reserva.update({
    where: { id: 15 },
    data: { facturaId: 6 },
  });

  // 9) Crear links de formulario
  await prisma.linkFormulario.createMany({
    data: [
      // Links completados que generaron reservas
      {
        id: 1,
        url: 'https://hotel-san-miguel.com/formulario/abc123def456',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-01-10'),
        numeroHabitacion: 203,
        fechaInicio: new Date('2025-02-15'),
        fechaFin: new Date('2025-02-18'),
        costo: 1200.0,
        deleted: false,
      },
      {
        id: 2,
        url: 'https://hotel-san-miguel.com/formulario/br789silva456',
        completado: true,
        expirado: false,
        vencimiento: new Date('2024-12-10'),
        numeroHabitacion: 103,
        fechaInicio: new Date('2024-12-15'),
        fechaFin: new Date('2024-12-18'),
        costo: 900.0,
        deleted: false,
      },
      {
        id: 3,
        url: 'https://hotel-san-miguel.com/formulario/ve456morales789',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-02-15'),
        numeroHabitacion: 201,
        fechaInicio: new Date('2025-02-20'),
        fechaFin: new Date('2025-02-22'),
        costo: 240.0,
        deleted: false,
      },
      {
        id: 4,
        url: 'https://hotel-san-miguel.com/formulario/fr234dubois567',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-02-25'),
        numeroHabitacion: 203,
        fechaInicio: new Date('2025-03-01'),
        fechaFin: new Date('2025-03-05'),
        costo: 1280.0,
        deleted: false,
      },
      {
        id: 5,
        url: 'https://hotel-san-miguel.com/formulario/co567herrera890',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-03-05'),
        numeroHabitacion: 202,
        fechaInicio: new Date('2025-03-10'),
        fechaFin: new Date('2025-03-13'),
        costo: 510.0,
        deleted: false,
      },
      {
        id: 6,
        url: 'https://hotel-san-miguel.com/formulario/it345rossi678',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-03-10'),
        numeroHabitacion: 203,
        fechaInicio: new Date('2025-03-15'),
        fechaFin: new Date('2025-03-17'),
        costo: 640.0,
        deleted: false,
      },
      {
        id: 7,
        url: 'https://hotel-san-miguel.com/formulario/ar678torres901',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-03-15'),
        numeroHabitacion: 303,
        fechaInicio: new Date('2025-03-20'),
        fechaFin: new Date('2025-03-23'),
        costo: 1140.0,
        deleted: false,
      },
      {
        id: 8,
        url: 'https://hotel-san-miguel.com/formulario/jp789yamamoto012',
        completado: true,
        expirado: false,
        vencimiento: new Date('2025-03-20'),
        numeroHabitacion: 301,
        fechaInicio: new Date('2025-03-25'),
        fechaFin: new Date('2025-03-28'),
        costo: 330.0,
        deleted: false,
      },
      // Links pendientes
      {
        id: 9,
        url: 'https://hotel-san-miguel.com/formulario/pending123new456',
        completado: false,
        expirado: false,
        vencimiento: new Date('2025-04-15'),
        numeroHabitacion: 304,
        fechaInicio: new Date('2025-04-01'),
        fechaFin: new Date('2025-04-05'),
        costo: 2000.0,
        deleted: false,
      },
      {
        id: 10,
        url: 'https://hotel-san-miguel.com/formulario/future789xyz012',
        completado: false,
        expirado: false,
        vencimiento: new Date('2025-04-20'),
        numeroHabitacion: 105,
        fechaInicio: new Date('2025-04-10'),
        fechaFin: new Date('2025-04-12'),
        costo: 700.0,
        deleted: false,
      },
      // Links expirados
      {
        id: 11,
        url: 'https://hotel-san-miguel.com/formulario/old123expired456',
        completado: false,
        expirado: true,
        vencimiento: new Date('2024-12-31'),
        numeroHabitacion: 102,
        fechaInicio: new Date('2025-01-05'),
        fechaFin: new Date('2025-01-08'),
        costo: 450.0,
        deleted: false,
      },
      {
        id: 12,
        url: 'https://hotel-san-miguel.com/formulario/expired789old012',
        completado: false,
        expirado: true,
        vencimiento: new Date('2024-11-30'),
        numeroHabitacion: 201,
        fechaInicio: new Date('2024-12-01'),
        fechaFin: new Date('2024-12-03'),
        costo: 240.0,
        deleted: false,
      },
    ],
  });

  // 10) Crear formularios (siguiendo el flujo: LinkFormulario → Formulario → Reserva)
  await prisma.formulario.createMany({
    data: [
      // Formularios originales
      {
        id: 1,
        huespedId: 1,
        reservaId: 1,
        SubidoATra: true,
        traId: 12345,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 2,
        huespedId: 2,
        reservaId: 2,
        SubidoATra: true,
        traId: 12346,
        SubidoASire: false,
        deleted: false,
      },
      {
        id: 3,
        huespedId: 3,
        reservaId: 4,
        SubidoATra: false,
        traId: null,
        SubidoASire: false,
        deleted: false,
      },
      // Formularios del flujo: Link → Formulario → Reserva
      {
        id: 4,
        huespedId: 4,
        reservaId: 6, // Reserva actual de Carlos Silva
        SubidoATra: true,
        traId: 12347,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 5,
        huespedId: 4,
        reservaId: 13, // Reserva pasada de Carlos Silva
        SubidoATra: true,
        traId: 12348,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 6,
        huespedId: 5,
        reservaId: 7, // Reserva de Gabriela Morales
        SubidoATra: true,
        traId: 12349,
        SubidoASire: false,
        deleted: false,
      },
      {
        id: 7,
        huespedId: 6,
        reservaId: 8, // Reserva actual de Pierre Dubois
        SubidoATra: true,
        traId: 12350,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 8,
        huespedId: 6,
        reservaId: 15, // Reserva pasada de Pierre Dubois
        SubidoATra: true,
        traId: 12351,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 9,
        huespedId: 7,
        reservaId: 9, // Reserva actual de Luis Herrera
        SubidoATra: false,
        traId: null,
        SubidoASire: false,
        deleted: false,
      },
      {
        id: 10,
        huespedId: 7,
        reservaId: 14, // Reserva pasada de Luis Herrera
        SubidoATra: true,
        traId: 12352,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 11,
        huespedId: 8,
        reservaId: 10, // Reserva de Sofia Rossi
        SubidoATra: true,
        traId: 12353,
        SubidoASire: false,
        deleted: false,
      },
      {
        id: 12,
        huespedId: 9,
        reservaId: 11, // Reserva de Roberto Torres
        SubidoATra: true,
        traId: 12354,
        SubidoASire: true,
        deleted: false,
      },
      {
        id: 13,
        huespedId: 10,
        reservaId: 12, // Reserva de Akiko Yamamoto
        SubidoATra: false,
        traId: null,
        SubidoASire: false,
        deleted: false,
      },
    ],
  });

  // 11) Actualizar links de formulario completados con sus formularios
  await prisma.linkFormulario.update({
    where: { id: 1 },
    data: { formularioId: 4 }, // Formulario de Carlos Silva (reserva 6)
  });

  await prisma.linkFormulario.update({
    where: { id: 2 },
    data: { formularioId: 5 }, // Formulario de Carlos Silva (reserva 13)
  });

  await prisma.linkFormulario.update({
    where: { id: 3 },
    data: { formularioId: 6 }, // Formulario de Gabriela Morales
  });

  await prisma.linkFormulario.update({
    where: { id: 4 },
    data: { formularioId: 7 }, // Formulario de Pierre Dubois (reserva 8)
  });

  await prisma.linkFormulario.update({
    where: { id: 5 },
    data: { formularioId: 9 }, // Formulario de Luis Herrera (reserva 9)
  });

  await prisma.linkFormulario.update({
    where: { id: 6 },
    data: { formularioId: 11 }, // Formulario de Sofia Rossi
  });

  await prisma.linkFormulario.update({
    where: { id: 7 },
    data: { formularioId: 12 }, // Formulario de Roberto Torres
  });

  await prisma.linkFormulario.update({
    where: { id: 8 },
    data: { formularioId: 13 }, // Formulario de Akiko Yamamoto
  });

  // 12) Crear algunos tokens en blacklist
  await prisma.tokenBlacklist.createMany({
    data: [
      {
        id: 1,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example1',
      },
      {
        id: 2,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example2',
      },
      {
        id: 3,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example3',
      },
    ],
  });

  console.log('🌱 Seed completado exitosamente!');
  console.log('====================================');
  console.log('📊 RESUMEN DE DATOS CREADOS:');
  console.log('✅ Usuarios: 4');
  console.log('✅ Huéspedes principales: 10');
  console.log('✅ Huéspedes secundarios: 8');
  console.log('✅ Habitaciones: 12');
  console.log('✅ Reservas: 15 (3 finalizadas, 10 reservadas, 2 pendientes)');
  console.log('✅ Documentos: 18 (10 principales + 8 secundarios)');
  console.log('✅ Facturas: 13 (6 finalizadas + 7 pendientes)');
  console.log(
    '✅ Links de formulario: 12 (8 completados + 2 pendientes + 2 expirados)',
  );
  console.log('✅ Formularios: 13 (conectando links → huéspedes → reservas)');
  console.log('✅ Tokens en blacklist: 3');
  console.log('====================================');
  console.log('🔄 FLUJO REPRESENTADO:');
  console.log('1. Usuario crea LinkFormulario');
  console.log('2. Huésped llena formulario → crea Huesped + HuespedSecundario');
  console.log('3. Se genera Reserva vinculada a Habitacion');
  console.log('4. Se suben Documentos de identificación');
  console.log('5. Se crea Formulario que conecta todo');
  console.log('6. Se genera Factura al finalizar estadía');
  console.log('====================================');
  console.log(
    '🌍 PAÍSES REPRESENTADOS: Colombia, Brasil, Venezuela, Francia, Italia, Argentina, Japón, Estados Unidos',
  );
  console.log('🏨 TIPOS DE HABITACIÓN: Sencilla, Doble, Suite, Apartamento');
  console.log(
    '📋 ESTADOS DE RESERVA: Finalizado, Reservado, Pendiente, Cancelado',
  );
  console.log('🎯 MOTIVOS DE VIAJE: Todos los enums disponibles');
  console.log('====================================');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
