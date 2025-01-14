const url = 'http://localhost:3001/registro-formulario';

// Cuerpo de la solicitud
const requestBody = {
  // Datos de la reserva
  fecha_inicio: new Date('2025-01-15T12:00:00Z'),
  fecha_fin: new Date('2025-01-20T12:00:00Z'),
  motivo_viaje: 'Vacaciones',
  costo: 500.75,
  habitacionId: 101,
  numero_acompaniantes: 2,

  // Datos del huésped
  tipo_documento: 'CC', // Asegúrate de usar un valor válido en el enum TipoDoc
  numero_documento: '123456789',
  primer_apellido: 'Pérez',
  segundo_apellido: 'López',
  nombres: 'Juan Carlos',
  pais_residencia: 'Colombia',
  departamento_residencia: 'Antioquia',
  ciudad_residencia: 'Medellín',
  fecha_nacimiento: new Date('1990-05-15T00:00:00Z'),
  nacionalidad: 'Colombiana',
  ocupacion: 'Ingeniero',
  genero: 'MASCULINO', // Asegúrate de usar un valor válido en el enum Genero
  telefono: '+573001234567',
  correo: 'juan.perez@example.com',
};

// Configuración de la solicitud
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody), // Convierte el cuerpo a JSON
};

console.log(options.body);

// Realizar la solicitud
fetch(url, options)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log('Respuesta del servidor:', data);
  })
  .catch((error) => {
    console.error('Error en la solicitud:', error);
  });
