// ====== CONFIGURACIÓN ======
const TIEMPO_TOTAL_SEGUNDOS = 600; // 10:00 para toda la evaluación

// ====== ESTADO ======
let jugador = {
  nombre: "",
  cm: "",
  puntaje: 0,
  preguntaActual: 0
};

let preguntas = [];
let categorias = {};          // { "Misión": {correctas:0, total:0}, ... }
let etapa = "responder";      // "responder" | "avanzar"
let tiempoRestante = TIEMPO_TOTAL_SEGUNDOS;
let temporizador = null;

// ====== ELEMENTOS ======
const pantallaInicio = document.getElementById("inicio");
const pantallaQuiz = document.getElementById("quiz");
const pantallaFinal = document.getElementById("resultado");

const nombreInput = document.getElementById("nombre");
const cmInput = document.getElementById("cm");

const contador = document.getElementById("contador");
const categoriaActual = document.getElementById("categoriaActual");
const cronometro = document.getElementById("cronometro");
const barra = document.getElementById("barra");

const pregunta = document.getElementById("pregunta");
const respuestas = document.getElementById("respuestas");

const feedback = document.getElementById("feedback");
const feedbackTitulo = document.getElementById("feedbackTitulo");
const feedbackTexto = document.getElementById("feedbackTexto");

const btnComenzar = document.getElementById("btnComenzar");
const btnSiguiente = document.getElementById("btnSiguiente");

const elPorcentaje = document.getElementById("porcentaje");
const elMensaje = document.getElementById("mensaje");
const elDetalle = document.getElementById("detalle");
const elDesglose = document.getElementById("desglose");

// ====== INICIAR ======
btnComenzar.onclick = () => {

  if (nombreInput.value.trim() === "" || cmInput.value.trim() === "") {
    alert("Debes ingresar Nombre y CM");
    return;
  }

  jugador.nombre = nombreInput.value.trim();
  jugador.cm = cmInput.value.trim();

  preguntas = [...DATA].sort(() => Math.random() - 0.5);

  // inicializar contador de categorías
  categorias = {};
  preguntas.forEach(p => {
    if (!categorias[p.categoria]) categorias[p.categoria] = { correctas: 0, total: 0 };
    categorias[p.categoria].total++;
  });

  construirCarril();

  pantallaInicio.style.display = "none";
  pantallaQuiz.style.display = "flex";

  iniciarCronometro();
  mostrarPregunta();
};

// ====== CRONÓMETRO GLOBAL ======
function iniciarCronometro() {
  actualizarCronometro();
  temporizador = setInterval(() => {
    tiempoRestante--;
    actualizarCronometro();

    if (tiempoRestante <= 60) cronometro.classList.add("alerta");

    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      terminar();
    }
  }, 1000);
}

function actualizarCronometro() {
  const min = Math.floor(tiempoRestante / 60).toString().padStart(2, "0");
  const seg = (tiempoRestante % 60).toString().padStart(2, "0");
  cronometro.textContent = `${min}:${seg}`;
}

// ====== CARRIL DE PROGRESO ======
function construirCarril() {
  barra.innerHTML = "";
  preguntas.forEach(() => {
    const seg = document.createElement("div");
    seg.className = "segmento";
    barra.appendChild(seg);
  });
}

function marcarSegmento(indice, clase) {
  const segmentos = barra.querySelectorAll(".segmento");
  segmentos.forEach(s => s.classList.remove("actual"));
  if (segmentos[indice]) segmentos[indice].classList.add(clase);
}

// ====== MOSTRAR PREGUNTA ======
function mostrarPregunta() {

  if (jugador.preguntaActual >= preguntas.length) {
    terminar();
    return;
  }

  etapa = "responder";
  feedback.style.display = "none";
  feedback.classList.remove("ok", "mal");
  btnSiguiente.textContent = "Comprobar respuesta";

  const p = preguntas[jugador.preguntaActual];

  contador.innerHTML = String(jugador.preguntaActual + 1).padStart(2, "0") +
    `<span class="dorsal-total">/${preguntas.length}</span>`;
  categoriaActual.textContent = p.categoria;

  marcarSegmento(jugador.preguntaActual, "actual");

  pregunta.textContent = p.pregunta;
  respuestas.innerHTML = "";

  if (p.tipo === "texto") {
    respuestas.innerHTML = `<input id="respuestaTexto" placeholder="Escribe tu respuesta">`;
  } else {
    const opciones = [...p.opciones].sort(() => Math.random() - 0.5);

    opciones.forEach(op => {
      const btn = document.createElement("button");
      btn.className = "opcion";
      btn.textContent = op;
      btn.onclick = () => {
        if (etapa !== "responder") return;
        document.querySelectorAll(".opcion").forEach(b => b.classList.remove("seleccion"));
        btn.classList.add("seleccion");
      };
      respuestas.appendChild(btn);
    });
  }
}

// ====== BOTÓN SIGUIENTE / COMPROBAR ======
btnSiguiente.onclick = () => {

  if (etapa === "responder") {
    comprobarRespuesta();
  } else {
    jugador.preguntaActual++;
    mostrarPregunta();
  }
};

function comprobarRespuesta() {

  const p = preguntas[jugador.preguntaActual];
  let esCorrecta = false;

  if (p.tipo === "texto") {
    const input = document.getElementById("respuestaTexto");
    const r = input.value.trim().toLowerCase();

    if (r === "") {
      alert("Escribe una respuesta.");
      return;
    }

    esCorrecta = r === p.correcta.toLowerCase();
    input.disabled = true;

  } else {
    const seleccion = document.querySelector(".opcion.seleccion");

    if (!seleccion) {
      alert("Selecciona una respuesta.");
      return;
    }

    esCorrecta = seleccion.textContent === p.correcta;

    document.querySelectorAll(".opcion").forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === p.correcta) btn.classList.add("correcta");
      else if (btn.classList.contains("seleccion")) btn.classList.add("incorrecta");
    });
  }

  if (esCorrecta) {
    jugador.puntaje++;
    categorias[p.categoria].correctas++;
    marcarSegmento(jugador.preguntaActual, "correcta");
  } else {
    marcarSegmento(jugador.preguntaActual, "incorrecta");
  }

  feedback.style.display = "block";
  feedback.classList.add(esCorrecta ? "ok" : "mal");
  feedbackTitulo.textContent = esCorrecta ? "✅ ¡Correcto!" : "❌ No es correcto";
  feedbackTexto.textContent = esCorrecta
    ? p.explicacion
    : `La respuesta correcta era: "${p.correcta}". ${p.explicacion}`;

  etapa = "avanzar";
  btnSiguiente.textContent =
    (jugador.preguntaActual === preguntas.length - 1) ? "Ver resultados →" : "Siguiente pregunta →";
}

// ====== FINAL ======
function terminar() {

  clearInterval(temporizador);

  pantallaQuiz.style.display = "none";
  pantallaFinal.style.display = "flex";

  const porcentaje = Math.round((jugador.puntaje / preguntas.length) * 100);

  let mensaje = "";
  if (porcentaje >= 90) mensaje = "🏆 Excelente. Dominas la cultura Skechers.";
  else if (porcentaje >= 70) mensaje = "👏 Muy buen trabajo.";
  else if (porcentaje >= 50) mensaje = "🙂 Vas bien, pero puedes reforzar algunos temas.";
  else mensaje = "📚 Te recomendamos repasar la Cultura Organizacional.";

  elPorcentaje.textContent = porcentaje + "%";
  elMensaje.textContent = mensaje;
  elDetalle.textContent =
    `${jugador.nombre} (CM: ${jugador.cm}) — ${jugador.puntaje} de ${preguntas.length} respuestas correctas.`;

  renderDesglose();

  if (porcentaje >= 90 && typeof confetti === "function") {
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
  }
}

function renderDesglose() {
  elDesglose.innerHTML = "";

  Object.entries(categorias).forEach(([nombre, datos]) => {
    const pct = Math.round((datos.correctas / datos.total) * 100);

    const fila = document.createElement("div");
    fila.className = "fila-desglose";
    fila.innerHTML = `
      <span class="nombreCat">${nombre}</span>
      <span class="track"><span class="relleno" style="width:${pct}%"></span></span>
      <span class="valorCat">${pct}%</span>
    `;
    elDesglose.appendChild(fila);
  });
}
