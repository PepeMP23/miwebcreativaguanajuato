// REGISTRO
function guardarRegistro() {
  const nombre = document.getElementById('nombre').value.trim();
  const edad = document.getElementById('edad').value;
  const municipio = document.getElementById('municipio').value;

  if (!nombre || !edad || !municipio) {
    alert("Completa todos los campos");
    return;
  }

  localStorage.setItem('usuario', JSON.stringify({ nombre, edad, municipio }));
  localStorage.setItem('respuestas', JSON.stringify([]));

  window.location.href = "quiz.html";
}

// MISIONES
document.addEventListener("DOMContentLoaded", () => {
  const checks = document.querySelectorAll('.check');
  if (checks.length > 0) {
    checks.forEach(c => c.addEventListener('change', verificarMisiones));
  }

  const nombreSpan = document.getElementById("nombreUsuario");
  if (nombreSpan) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    nombreSpan.innerText = usuario.nombre;
  }
});

function verificarMisiones() {
  const checks = document.querySelectorAll('.check');
  const completas = [...checks].every(c => c.checked);

  if (completas) {
    setTimeout(() => {
      window.location.href = "resultado.html";
    }, 500);
  }
}

// ================= QUIZ =================

const preguntas = [
  {
    texto: "¿Qué prefieres probar?",
    opciones: [
      { texto: "Cajeta de Celaya", ruta: "gastronomica" },
      { texto: "Guacamayas de León", ruta: "gastronomica" }
    ]
  },
  {
    texto: "¿Qué experiencia te llama más?",
    opciones: [
      { texto: "Ver cómo se crean artesanías", ruta: "artesano" },
      { texto: "Conocer el oficio del curtido", ruta: "curtidor" }
    ]
  },
  {
    texto: "En un plan ideal eliges…",
    opciones: [
      { texto: "Caminar por pueblos mágicos", ruta: "artesano" },
      { texto: "Probar comida local", ruta: "gastronomica" }
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("pregunta")) return;

  localStorage.setItem("indiceQuiz", "0");
  localStorage.setItem("respuestas", JSON.stringify([]));

  cargarPregunta();
});

function cargarPregunta() {
  const indice = parseInt(localStorage.getItem("indiceQuiz"));
  const pregunta = preguntas[indice];

  document.getElementById("pregunta").innerText = pregunta.texto;

  const btn1 = document.getElementById("opcion1");
  const btn2 = document.getElementById("opcion2");

  btn1.innerText = pregunta.opciones[0].texto;
  btn2.innerText = pregunta.opciones[1].texto;

  btn1.onclick = () => responder(pregunta.opciones[0].ruta);
  btn2.onclick = () => responder(pregunta.opciones[1].ruta);
}

function responder(ruta) {
  const respuestas = JSON.parse(localStorage.getItem("respuestas"));
  respuestas.push(ruta);
  localStorage.setItem("respuestas", JSON.stringify(respuestas));

  let indice = parseInt(localStorage.getItem("indiceQuiz"));
  indice++;

  if (indice < preguntas.length) {
    localStorage.setItem("indiceQuiz", indice);
    cargarPregunta();
  } else {
    window.location.href = "misiones.html";
  }
}
