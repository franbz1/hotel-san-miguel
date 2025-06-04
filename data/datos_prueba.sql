-- =====================================================
-- DATOS DE PRUEBA - HOTEL SAN MIGUEL
-- =====================================================
-- Este archivo contiene datos de prueba consistentes
-- para el sistema hotelero, organizados por módulos
-- =====================================================

-- Limpiar datos existentes (opcional)
TRUNCATE TABLE "TokenBlacklist", "Formulario", "LinkFormulario", "Factura", "Documento", "Reserva", "HuespedSecundario", "Huesped", "Habitacion", "Usuario" RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. USUARIOS DEL SISTEMA
-- =====================================================

INSERT INTO "Usuario" (nombre, rol, password, "createdAt", "updatedAt") VALUES
('Admin Principal', 'ADMINISTRADOR', '$2b$10$example.hash.admin', NOW(), NOW()),
('Maria Rodriguez', 'ADMINISTRADOR', '$2b$10$example.hash.maria', NOW(), NOW()),
('Carlos Gutierrez', 'CAJERO', '$2b$10$example.hash.carlos', NOW(), NOW()),
('Ana Martinez', 'CAJERO', '$2b$10$example.hash.ana', NOW(), NOW()),
('Luis Hernandez', 'CAJERO', '$2b$10$example.hash.luis', NOW(), NOW()),
('Rosa Perez', 'ASEO', '$2b$10$example.hash.rosa', NOW(), NOW()),
('Carmen Lopez', 'ASEO', '$2b$10$example.hash.carmen', NOW(), NOW()),
('Sistema Registro', 'REGISTRO_FORMULARIO', '$2b$10$example.hash.sistema', NOW(), NOW());

-- =====================================================
-- 2. HABITACIONES
-- =====================================================

INSERT INTO "Habitacion" (numero_habitacion, tipo, estado, precio_por_noche, "createdAt", "updatedAt") VALUES
-- Habitaciones Sencillas
(101, 'SENCILLA', 'LIBRE', 45000, NOW(), NOW()),
(102, 'SENCILLA', 'LIBRE', 45000, NOW(), NOW()),
(103, 'SENCILLA', 'OCUPADO', 45000, NOW(), NOW()),
(104, 'SENCILLA', 'LIBRE', 45000, NOW(), NOW()),
(105, 'SENCILLA', 'EN_LIMPIEZA', 45000, NOW(), NOW()),

-- Habitaciones Dobles
(201, 'DOBLE', 'LIBRE', 75000, NOW(), NOW()),
(202, 'DOBLE', 'OCUPADO', 75000, NOW(), NOW()),
(203, 'DOBLE', 'LIBRE', 75000, NOW(), NOW()),
(204, 'DOBLE', 'RESERVADO', 75000, NOW(), NOW()),
(205, 'DOBLE', 'LIBRE', 75000, NOW(), NOW()),

-- Suites
(301, 'SUITE', 'LIBRE', 120000, NOW(), NOW()),
(302, 'SUITE', 'OCUPADO', 120000, NOW(), NOW()),
(303, 'SUITE', 'LIBRE', 120000, NOW(), NOW()),

-- Habitaciones Múltiples
(401, 'MÚLTIPLE', 'LIBRE', 60000, NOW(), NOW()),
(402, 'MÚLTIPLE', 'LIBRE', 60000, NOW(), NOW()),
(403, 'MÚLTIPLE', 'EN_MANTENIMIENTO', 60000, NOW(), NOW()),

-- Apartamentos
(501, 'APARTAMENTO', 'LIBRE', 150000, NOW(), NOW()),
(502, 'APARTAMENTO', 'OCUPADO', 150000, NOW(), NOW()),

-- Otras opciones
(601, 'HAMACA', 'LIBRE', 25000, NOW(), NOW()),
(602, 'HAMACA', 'LIBRE', 25000, NOW(), NOW()),
(701, 'CAMPING', 'LIBRE', 15000, NOW(), NOW()),
(702, 'CAMPING', 'LIBRE', 15000, NOW(), NOW());

-- =====================================================
-- 3. HUÉSPEDES PRINCIPALES
-- =====================================================

INSERT INTO "Huesped" (tipo_documento, numero_documento, primer_apellido, segundo_apellido, nombres, pais_residencia, ciudad_residencia, pais_procedencia, ciudad_procedencia, lugar_nacimiento, fecha_nacimiento, nacionalidad, ocupacion, genero, telefono, correo, "createdAt", "updatedAt") VALUES
-- Huéspedes Colombianos
('CC', '1234567890', 'Rodriguez', 'Martinez', 'Juan Carlos', 'Colombia', 'Bogotá', 'Colombia', 'Bogotá', 'Bogotá, Colombia', '1985-03-15', 'Colombia', 'Ingeniero', 'MASCULINO', '+57 300 123 4567', 'juan.rodriguez@email.com', NOW(), NOW()),
('CC', '9876543210', 'Gonzalez', 'Lopez', 'Maria Elena', 'Colombia', 'Medellín', 'Colombia', 'Medellín', 'Medellín, Colombia', '1990-07-22', 'Colombia', 'Abogada', 'FEMENINO', '+57 310 987 6543', 'maria.gonzalez@email.com', NOW(), NOW()),
('CC', '5555666677', 'Hernandez', 'Silva', 'Carlos Alberto', 'Colombia', 'Cali', 'Colombia', 'Cali', 'Cali, Colombia', '1988-11-30', 'Colombia', 'Médico', 'MASCULINO', '+57 320 555 6666', 'carlos.hernandez@email.com', NOW(), NOW()),
('CC', '1111222233', 'Martinez', 'Perez', 'Ana Sofia', 'Colombia', 'Barranquilla', 'Colombia', 'Barranquilla', 'Barranquilla, Colombia', '1992-05-18', 'Colombia', 'Arquitecta', 'FEMENINO', '+57 315 111 2222', 'ana.martinez@email.com', NOW(), NOW()),

-- Huéspedes Venezolanos
('PASAPORTE', 'V12345678', 'Garcia', 'Mendez', 'Pedro José', 'Venezuela', 'Caracas', 'Venezuela', 'Caracas', 'Caracas, Venezuela', '1987-09-12', 'Venezuela', 'Contador', 'MASCULINO', '+58 412 123 4567', 'pedro.garcia@email.com', NOW(), NOW()),
('CE', '9876543', 'Fernandez', 'Ruiz', 'Lucia Isabel', 'Venezuela', 'Maracaibo', 'Venezuela', 'Maracaibo', 'Maracaibo, Venezuela', '1991-12-08', 'Venezuela', 'Enfermera', 'FEMENINO', '+58 424 987 6543', 'lucia.fernandez@email.com', NOW(), NOW()),
('PASAPORTE', 'V87654321', 'Morales', 'Castro', 'Rafael Antonio', 'Venezuela', 'Valencia', 'Venezuela', 'Valencia', 'Valencia, Venezuela', '1983-04-25', 'Venezuela', 'Profesor', 'MASCULINO', '+58 414 876 5432', 'rafael.morales@email.com', NOW(), NOW()),

-- Huéspedes Extranjeros
('PASAPORTE', 'US1234567', 'Johnson', '', 'Michael David', 'Estados Unidos', 'Miami', 'Estados Unidos', 'Miami', 'New York, USA', '1980-08-10', 'Estados Unidos', 'Consultor', 'MASCULINO', '+1 305 123 4567', 'michael.johnson@email.com', NOW(), NOW()),
('PASAPORTE', 'BR9876543', 'Silva', 'Santos', 'Carla Regina', 'Brasil', 'São Paulo', 'Brasil', 'São Paulo', 'Rio de Janeiro, Brasil', '1989-06-14', 'Brasil', 'Diseñadora', 'FEMENINO', '+55 11 98765 4321', 'carla.silva@email.com', NOW(), NOW()),
('PASAPORTE', 'AR5555666', 'Gutierrez', 'Moreno', 'Diego Alejandro', 'Argentina', 'Buenos Aires', 'Argentina', 'Buenos Aires', 'Córdoba, Argentina', '1986-02-28', 'Argentina', 'Periodista', 'MASCULINO', '+54 11 5555 6666', 'diego.gutierrez@email.com', NOW(), NOW()),

-- Huéspedes Nacionales adicionales
('CC', '4444555566', 'Ramirez', 'Torres', 'Sandra Milena', 'Colombia', 'Bucaramanga', 'Colombia', 'Bucaramanga', 'Bucaramanga, Colombia', '1993-01-12', 'Colombia', 'Psicóloga', 'FEMENINO', '+57 318 444 5555', 'sandra.ramirez@email.com', NOW(), NOW()),
('CC', '7777888899', 'Vargas', 'Jimenez', 'Andres Felipe', 'Colombia', 'Cartagena', 'Colombia', 'Cartagena', 'Cartagena, Colombia', '1984-10-05', 'Colombia', 'Empresario', 'MASCULINO', '+57 312 777 8888', 'andres.vargas@email.com', NOW(), NOW()),
('CC', '2222333344', 'Castro', 'Herrera', 'Patricia Elena', 'Colombia', 'Manizales', 'Colombia', 'Manizales', 'Manizales, Colombia', '1995-03-20', 'Colombia', 'Estudiante', 'FEMENINO', '+57 316 222 3333', 'patricia.castro@email.com', NOW(), NOW()),
('CC', '6666777788', 'Moreno', 'Diaz', 'Fernando José', 'Colombia', 'Pereira', 'Colombia', 'Pereira', 'Pereira, Colombia', '1982-12-18', 'Colombia', 'Ingeniero Civil', 'MASCULINO', '+57 321 666 7777', 'fernando.moreno@email.com', NOW(), NOW()),
('CC', '8888999900', 'Lopez', 'Garcia', 'Carmen Rosa', 'Colombia', 'Pasto', 'Colombia', 'Pasto', 'Pasto, Colombia', '1990-09-03', 'Colombia', 'Veterinaria', 'FEMENINO', '+57 314 888 9999', 'carmen.lopez@email.com', NOW(), NOW());

-- =====================================================
-- 4. HUÉSPEDES SECUNDARIOS (Acompañantes)
-- =====================================================

INSERT INTO "HuespedSecundario" (tipo_documento, numero_documento, primer_apellido, segundo_apellido, nombres, pais_residencia, ciudad_residencia, pais_procedencia, ciudad_procedencia, fecha_nacimiento, nacionalidad, ocupacion, genero, telefono, correo, "huespedId", "createdAt", "updatedAt") VALUES
-- Acompañantes de Juan Carlos Rodriguez (ID: 1)
('CC', '1234567891', 'Rodriguez', 'Martinez', 'Sofia Isabel', 'Colombia', 'Bogotá', 'Colombia', 'Bogotá', '1987-05-20', 'Colombia', 'Diseñadora', 'FEMENINO', '+57 300 123 4568', 'sofia.rodriguez@email.com', 1, NOW(), NOW()),
('TI', '1234567892', 'Rodriguez', 'Martinez', 'Mateo Alejandro', 'Colombia', 'Bogotá', 'Colombia', 'Bogotá', '2010-08-15', 'Colombia', 'Estudiante', 'MASCULINO', NULL, NULL, 1, NOW(), NOW()),

-- Acompañantes de Maria Elena Gonzalez (ID: 2)
('CC', '9876543211', 'Gonzalez', 'Vargas', 'Roberto Carlos', 'Colombia', 'Medellín', 'Colombia', 'Medellín', '1988-03-10', 'Colombia', 'Comerciante', 'MASCULINO', '+57 310 987 6544', 'roberto.gonzalez@email.com', 2, NOW(), NOW()),

-- Acompañantes de Pedro José Garcia (ID: 5)
('PASAPORTE', 'V12345679', 'Garcia', 'Lugo', 'Esperanza María', 'Venezuela', 'Caracas', 'Venezuela', 'Caracas', '1990-11-25', 'Venezuela', 'Nutricionista', 'FEMENINO', '+58 412 123 4568', 'esperanza.garcia@email.com', 5, NOW(), NOW()),

-- Acompañantes de Michael Johnson (ID: 8)
('PASAPORTE', 'US1234568', 'Johnson', '', 'Sarah Elizabeth', 'Estados Unidos', 'Miami', 'Estados Unidos', 'Miami', '1982-12-05', 'Estados Unidos', 'Abogada', 'FEMENINO', '+1 305 123 4568', 'sarah.johnson@email.com', 8, NOW(), NOW());

-- =====================================================
-- 5. RESERVAS DISTRIBUIDAS EN 2024
-- =====================================================

INSERT INTO "Reserva" (fecha_inicio, fecha_fin, estado, pais_procedencia, ciudad_procedencia, pais_destino, motivo_viaje, check_in, check_out, costo, numero_acompaniantes, "habitacionId", "huespedId", "createdAt", "updatedAt") VALUES
-- Enero 2024
('2024-01-15', '2024-01-18', 'FINALIZADO', 'Colombia', 'Bogotá', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-01-15 15:00:00', '2024-01-18 11:00:00', 135000, 2, 1, 1, '2024-01-10 10:00:00', '2024-01-18 11:00:00'),
('2024-01-22', '2024-01-25', 'FINALIZADO', 'Colombia', 'Medellín', 'Colombia', 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES', '2024-01-22 14:00:00', '2024-01-25 12:00:00', 225000, 1, 6, 2, '2024-01-18 09:00:00', '2024-01-25 12:00:00'),

-- Febrero 2024
('2024-02-05', '2024-02-09', 'FINALIZADO', 'Venezuela', 'Caracas', 'Colombia', 'VISITAS_A_FAMILIARES_Y_AMIGOS', '2024-02-05 16:00:00', '2024-02-09 10:00:00', 180000, 1, 3, 5, '2024-02-01 11:00:00', '2024-02-09 10:00:00'),
('2024-02-14', '2024-02-17', 'FINALIZADO', 'Estados Unidos', 'Miami', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-02-14 13:00:00', '2024-02-17 11:00:00', 360000, 1, 11, 8, '2024-02-10 08:00:00', '2024-02-17 11:00:00'),

-- Marzo 2024
('2024-03-10', '2024-03-14', 'FINALIZADO', 'Colombia', 'Cali', 'Colombia', 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES', '2024-03-10 15:00:00', '2024-03-14 12:00:00', 180000, 0, 2, 3, '2024-03-07 14:00:00', '2024-03-14 12:00:00'),
('2024-03-20', '2024-03-23', 'FINALIZADO', 'Brasil', 'São Paulo', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-03-20 14:00:00', '2024-03-23 11:00:00', 450000, 0, 18, 9, '2024-03-15 10:00:00', '2024-03-23 11:00:00'),

-- Abril 2024
('2024-04-08', '2024-04-12', 'FINALIZADO', 'Venezuela', 'Maracaibo', 'Colombia', 'SALUD_Y_ATENCION_MEDICA', '2024-04-08 16:00:00', '2024-04-12 10:00:00', 300000, 0, 7, 6, '2024-04-05 09:00:00', '2024-04-12 10:00:00'),
('2024-04-25', '2024-04-28', 'FINALIZADO', 'Colombia', 'Barranquilla', 'Colombia', 'EDUCACION_Y_FORMACION', '2024-04-25 15:00:00', '2024-04-28 11:00:00', 135000, 0, 4, 4, '2024-04-20 13:00:00', '2024-04-28 11:00:00'),

-- Mayo 2024
('2024-05-15', '2024-05-19', 'FINALIZADO', 'Argentina', 'Buenos Aires', 'Colombia', 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES', '2024-05-15 14:00:00', '2024-05-19 12:00:00', 240000, 0, 14, 10, '2024-05-12 11:00:00', '2024-05-19 12:00:00'),
('2024-05-28', '2024-06-02', 'FINALIZADO', 'Colombia', 'Bucaramanga', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-05-28 16:00:00', '2024-06-02 10:00:00', 375000, 0, 8, 11, '2024-05-25 08:00:00', '2024-06-02 10:00:00'),

-- Junio 2024
('2024-06-10', '2024-06-14', 'FINALIZADO', 'Venezuela', 'Valencia', 'Colombia', 'VISITAS_A_FAMILIARES_Y_AMIGOS', '2024-06-10 15:00:00', '2024-06-14 11:00:00', 480000, 0, 12, 7, '2024-06-07 12:00:00', '2024-06-14 11:00:00'),
('2024-06-22', '2024-06-25', 'FINALIZADO', 'Colombia', 'Cartagena', 'Colombia', 'COMPRAS', '2024-06-22 13:00:00', '2024-06-25 12:00:00', 135000, 0, 5, 12, '2024-06-18 09:00:00', '2024-06-25 12:00:00'),

-- Julio 2024
('2024-07-05', '2024-07-09', 'FINALIZADO', 'Colombia', 'Manizales', 'Colombia', 'OTROS_MOTIVOS', '2024-07-05 14:00:00', '2024-07-09 10:00:00', 180000, 0, 9, 13, '2024-07-02 10:00:00', '2024-07-09 10:00:00'),
('2024-07-18', '2024-07-22', 'FINALIZADO', 'Colombia', 'Pereira', 'Colombia', 'RELIGION_Y_PEREGRINACIONES', '2024-07-18 16:00:00', '2024-07-22 11:00:00', 300000, 0, 10, 14, '2024-07-15 14:00:00', '2024-07-22 11:00:00'),

-- Agosto 2024
('2024-08-12', '2024-08-16', 'FINALIZADO', 'Colombia', 'Pasto', 'Colombia', 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES', '2024-08-12 15:00:00', '2024-08-16 12:00:00', 240000, 0, 15, 15, '2024-08-09 11:00:00', '2024-08-16 12:00:00'),
('2024-08-25', '2024-08-29', 'FINALIZADO', 'Colombia', 'Bogotá', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-08-25 14:00:00', '2024-08-29 10:00:00', 200000, 0, 16, 1, '2024-08-22 08:00:00', '2024-08-29 10:00:00'),

-- Septiembre 2024
('2024-09-08', '2024-09-12', 'FINALIZADO', 'Venezuela', 'Caracas', 'Colombia', 'TRANSITO', '2024-09-08 13:00:00', '2024-09-12 11:00:00', 100000, 0, 19, 5, '2024-09-05 15:00:00', '2024-09-12 11:00:00'),
('2024-09-20', '2024-09-24', 'FINALIZADO', 'Colombia', 'Medellín', 'Colombia', 'EDUCACION_Y_FORMACION', '2024-09-20 16:00:00', '2024-09-24 12:00:00', 300000, 1, 13, 2, '2024-09-17 09:00:00', '2024-09-24 12:00:00'),

-- Octubre 2024
('2024-10-15', '2024-10-19', 'FINALIZADO', 'Brasil', 'São Paulo', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-10-15 15:00:00', '2024-10-19 11:00:00', 600000, 0, 17, 9, '2024-10-12 10:00:00', '2024-10-19 11:00:00'),
('2024-10-28', '2024-11-01', 'FINALIZADO', 'Colombia', 'Cali', 'Colombia', 'SALUD_Y_ATENCION_MEDICA', '2024-10-28 14:00:00', '2024-11-01 10:00:00', 180000, 0, 1, 3, '2024-10-25 12:00:00', '2024-11-01 10:00:00'),

-- Noviembre 2024
('2024-11-10', '2024-11-14', 'FINALIZADO', 'Estados Unidos', 'Miami', 'Colombia', 'NEGOCIOS_Y_MOTIVOS_PROFESIONALES', '2024-11-10 13:00:00', '2024-11-14 12:00:00', 480000, 1, 11, 8, '2024-11-07 11:00:00', '2024-11-14 12:00:00'),
('2024-11-25', '2024-11-29', 'FINALIZADO', 'Argentina', 'Buenos Aires', 'Colombia', 'COMPRAS', '2024-11-25 16:00:00', '2024-11-29 11:00:00', 240000, 0, 14, 10, '2024-11-22 09:00:00', '2024-11-29 11:00:00'),

-- Diciembre 2024
('2024-12-08', '2024-12-12', 'FINALIZADO', 'Venezuela', 'Maracaibo', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-12-08 15:00:00', '2024-12-12 10:00:00', 300000, 0, 7, 6, '2024-12-05 13:00:00', '2024-12-12 10:00:00'),
('2024-12-20', '2024-12-24', 'FINALIZADO', 'Colombia', 'Barranquilla', 'Colombia', 'VISITAS_A_FAMILIARES_Y_AMIGOS', '2024-12-20 14:00:00', '2024-12-24 11:00:00', 180000, 0, 4, 4, '2024-12-17 08:00:00', '2024-12-24 11:00:00'),

-- Reservas Activas/Futuras para 2025
('2024-12-28', '2025-01-02', 'RESERVADO', 'Colombia', 'Bucaramanga', 'Colombia', 'VACACIONES_RECREO_Y_OCIO', '2024-12-28 16:00:00', '2025-01-02 12:00:00', 375000, 0, 8, 11, NOW(), NOW()),
('2025-01-10', '2025-01-15', 'RESERVADO', 'Colombia', 'Pasto', 'Colombia', 'OTROS_MOTIVOS', '2025-01-10 15:00:00', '2025-01-15 11:00:00', 300000, 0, 10, 15, NOW(), NOW());

-- =====================================================
-- 6. FACTURAS
-- =====================================================

INSERT INTO "Factura" (total, fecha_factura, "huespedId", "createdAt", "updatedAt") VALUES
(135000, '2024-01-18 11:00:00', 1, '2024-01-18 11:00:00', '2024-01-18 11:00:00'),
(225000, '2024-01-25 12:00:00', 2, '2024-01-25 12:00:00', '2024-01-25 12:00:00'),
(180000, '2024-02-09 10:00:00', 5, '2024-02-09 10:00:00', '2024-02-09 10:00:00'),
(360000, '2024-02-17 11:00:00', 8, '2024-02-17 11:00:00', '2024-02-17 11:00:00'),
(180000, '2024-03-14 12:00:00', 3, '2024-03-14 12:00:00', '2024-03-14 12:00:00'),
(450000, '2024-03-23 11:00:00', 9, '2024-03-23 11:00:00', '2024-03-23 11:00:00'),
(300000, '2024-04-12 10:00:00', 6, '2024-04-12 10:00:00', '2024-04-12 10:00:00'),
(135000, '2024-04-28 11:00:00', 4, '2024-04-28 11:00:00', '2024-04-28 11:00:00'),
(240000, '2024-05-19 12:00:00', 10, '2024-05-19 12:00:00', '2024-05-19 12:00:00'),
(375000, '2024-06-02 10:00:00', 11, '2024-06-02 10:00:00', '2024-06-02 10:00:00'),
(480000, '2024-06-14 11:00:00', 7, '2024-06-14 11:00:00', '2024-06-14 11:00:00'),
(135000, '2024-06-25 12:00:00', 12, '2024-06-25 12:00:00', '2024-06-25 12:00:00'),
(180000, '2024-07-09 10:00:00', 13, '2024-07-09 10:00:00', '2024-07-09 10:00:00'),
(300000, '2024-07-22 11:00:00', 14, '2024-07-22 11:00:00', '2024-07-22 11:00:00'),
(240000, '2024-08-16 12:00:00', 15, '2024-08-16 12:00:00', '2024-08-16 12:00:00'),
(200000, '2024-08-29 10:00:00', 1, '2024-08-29 10:00:00', '2024-08-29 10:00:00'),
(100000, '2024-09-12 11:00:00', 5, '2024-09-12 11:00:00', '2024-09-12 11:00:00'),
(300000, '2024-09-24 12:00:00', 2, '2024-09-24 12:00:00', '2024-09-24 12:00:00'),
(600000, '2024-10-19 11:00:00', 9, '2024-10-19 11:00:00', '2024-10-19 11:00:00'),
(180000, '2024-11-01 10:00:00', 3, '2024-11-01 10:00:00', '2024-11-01 10:00:00'),
(480000, '2024-11-14 12:00:00', 8, '2024-11-14 12:00:00', '2024-11-14 12:00:00'),
(240000, '2024-11-29 11:00:00', 10, '2024-11-29 11:00:00', '2024-11-29 11:00:00'),
(300000, '2024-12-12 10:00:00', 6, '2024-12-12 10:00:00', '2024-12-12 10:00:00'),
(180000, '2024-12-24 11:00:00', 4, '2024-12-24 11:00:00', '2024-12-24 11:00:00');

-- =====================================================
-- 7. RELACIÓN RESERVAS - FACTURAS
-- =====================================================

UPDATE "Reserva" SET "facturaId" = 1 WHERE id = 1;
UPDATE "Reserva" SET "facturaId" = 2 WHERE id = 2;
UPDATE "Reserva" SET "facturaId" = 3 WHERE id = 3;
UPDATE "Reserva" SET "facturaId" = 4 WHERE id = 4;
UPDATE "Reserva" SET "facturaId" = 5 WHERE id = 5;
UPDATE "Reserva" SET "facturaId" = 6 WHERE id = 6;
UPDATE "Reserva" SET "facturaId" = 7 WHERE id = 7;
UPDATE "Reserva" SET "facturaId" = 8 WHERE id = 8;
UPDATE "Reserva" SET "facturaId" = 9 WHERE id = 9;
UPDATE "Reserva" SET "facturaId" = 10 WHERE id = 10;
UPDATE "Reserva" SET "facturaId" = 11 WHERE id = 11;
UPDATE "Reserva" SET "facturaId" = 12 WHERE id = 12;
UPDATE "Reserva" SET "facturaId" = 13 WHERE id = 13;
UPDATE "Reserva" SET "facturaId" = 14 WHERE id = 14;
UPDATE "Reserva" SET "facturaId" = 15 WHERE id = 15;
UPDATE "Reserva" SET "facturaId" = 16 WHERE id = 16;
UPDATE "Reserva" SET "facturaId" = 17 WHERE id = 17;
UPDATE "Reserva" SET "facturaId" = 18 WHERE id = 18;
UPDATE "Reserva" SET "facturaId" = 19 WHERE id = 19;
UPDATE "Reserva" SET "facturaId" = 20 WHERE id = 20;
UPDATE "Reserva" SET "facturaId" = 21 WHERE id = 21;
UPDATE "Reserva" SET "facturaId" = 22 WHERE id = 22;
UPDATE "Reserva" SET "facturaId" = 23 WHERE id = 23;
UPDATE "Reserva" SET "facturaId" = 24 WHERE id = 24;

-- =====================================================
-- 8. DOCUMENTOS SUBIDOS
-- =====================================================

INSERT INTO "Documento" (url, nombre, "huespedId", "createdAt") VALUES
('/uploads/docs/cc_1234567890.pdf', 'Cédula Juan Carlos Rodriguez', 1, NOW()),
('/uploads/docs/passport_us1234567.pdf', 'Pasaporte Michael Johnson', 8, NOW()),
('/uploads/docs/ce_9876543.pdf', 'Cédula Extranjería Lucia Fernandez', 6, NOW()),
('/uploads/docs/cc_9876543210.pdf', 'Cédula Maria Elena Gonzalez', 2, NOW()),
('/uploads/docs/passport_v12345678.pdf', 'Pasaporte Pedro José Garcia', 5, NOW());

-- =====================================================
-- 9. FORMULARIOS Y LINKS
-- =====================================================

INSERT INTO "LinkFormulario" ("url", completado, expirado, vencimiento, "numeroHabitacion", "fechaInicio", "fechaFin", costo, "createdAt", "updatedAt") VALUES
('https://forms.hotelsanmiguel.com/check-in/abc123', true, false, '2025-01-05 23:59:59', 101, '2024-01-15 15:00:00', '2024-01-18 11:00:00', 135000, NOW(), NOW()),
('https://forms.hotelsanmiguel.com/check-in/def456', true, false, '2025-01-28 23:59:59', 201, '2024-01-22 14:00:00', '2024-01-25 12:00:00', 225000, NOW(), NOW()),
('https://forms.hotelsanmiguel.com/check-in/ghi789', false, true, '2024-02-01 23:59:59', 103, '2024-02-05 16:00:00', '2024-02-09 10:00:00', 180000, NOW(), NOW());

INSERT INTO "Formulario" ("huespedId", "reservaId", "SubidoATra", "traId", "SubidoASire", "createdAt", "updatedAt") VALUES
(1, 1, true, 12345, true, NOW(), NOW()),
(2, 2, true, 12346, false, NOW(), NOW()),
(5, 3, false, NULL, false, NOW(), NOW());

-- Actualizar relaciones de LinkFormulario con Formulario
UPDATE "LinkFormulario" SET "formularioId" = 1 WHERE id = 1;
UPDATE "LinkFormulario" SET "formularioId" = 2 WHERE id = 2;
UPDATE "LinkFormulario" SET "formularioId" = 3 WHERE id = 3;

-- =====================================================
-- 10. TOKENS EN BLACKLIST (Ejemplos)
-- =====================================================

INSERT INTO "TokenBlacklist" (token, "createdAt", "updatedAt") VALUES
('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', NOW(), NOW()),
('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz', NOW(), NOW());

-- =====================================================
-- RESUMEN DE DATOS CREADOS
-- =====================================================

-- Usuarios: 8 (1 Admin Principal, 1 Admin, 3 Cajeros, 2 Aseo, 1 Sistema)
-- Habitaciones: 20 (Variedad de tipos y precios)
-- Huéspedes: 15 (Colombianos, Venezolanos y extranjeros)
-- Huéspedes Secundarios: 4 (Acompañantes)
-- Reservas: 26 (24 finalizadas en 2024, 2 futuras)
-- Facturas: 24 (Una por cada reserva finalizada)
-- Documentos: 5 (Ejemplos de documentos subidos)
-- Formularios: 3 (Con diferentes estados)
-- Links de Formulario: 3 (Relacionados con formularios)
-- Tokens Blacklist: 2 (Ejemplos de tokens revocados)

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. Los passwords están hasheados con ejemplos (cambiar en producción)
-- 2. Las reservas están distribuidas mensualmente en 2024 para analytics
-- 3. Se incluyen diferentes nacionalidades para análisis demográfico
-- 4. Los motivos de viaje están variados para análisis de segmentación
-- 5. Los precios varían según tipo de habitación y duración
-- 6. Se incluyen huéspedes recurrentes para análisis de fidelidad
-- 7. Las fechas de check-in/out respetan horarios hoteleros estándar 