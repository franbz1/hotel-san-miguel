document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createHuespedForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    const formData = new FormData(form); // Captura los datos del formulario
    const json = {};

    // Recorre los datos del formulario y los convierte en un objeto JSON
    formData.forEach((value, key) => {
      // Maneja campos numéricos si es necesario
      if (!isNaN(value) && value.trim() !== '') {
        json[key] = parseFloat(value);
      } else if (value.trim() !== '') {
        json[key] = value.trim();
      }
    });

    console.log(json); // Muestra el JSON en la consola
    alert(
      'Formulario convertido a JSON. Revisa la consola para ver el resultado.',
    );
  });
});
