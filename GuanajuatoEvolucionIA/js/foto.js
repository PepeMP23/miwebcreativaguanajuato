let imagen;

function mostrarFoto(e) {
  imagen = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => preview.src = reader.result;
  reader.readAsDataURL(imagen);
}

function descargar() {
  const link = document.createElement("a");
  link.href = preview.src;
  link.download = "guanajuato-evolucion.png";
  link.click();
}
