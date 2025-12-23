function guardarRegistro() {
  const usuario = {
    nombre: nombre.value,
    telefono: telefono.value,
    municipio: municipio.value,
    edad: edad.value
  };

  localStorage.setItem("usuario", JSON.stringify(usuario));
  location.href = "encuesta.html";
}
